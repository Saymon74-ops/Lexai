-- Esquema do Banco de Dados para LexIA (Supabase)

-- Habilitar a extensão UUID se ainda não houver
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Alunos (Extensão de auth.users)
CREATE TABLE public.alunos (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    faculdade VARCHAR(255),
    periodo INTEGER,
    plano VARCHAR(50) DEFAULT 'free',
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Trigger para criar aluno automaticamente e adicionar 7 dias de trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.alunos (id, nome, plano, trial_end)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'trial',
    NOW() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Tabela de Professores/Estilos
CREATE TABLE public.professores (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    disciplina VARCHAR(100),
    estilo_prova TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Tabela de Materiais (Resumos, Áudios)
CREATE TABLE public.materiais (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'pdf', 'audio', 'resumo'
    url_arquivo TEXT,
    conteudo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Tabela de Conversas (Histórico WhatsApp)
CREATE TABLE public.conversas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    origem VARCHAR(50) NOT NULL, -- 'user', 'bot'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Tabela de Questões Respondidas
CREATE TABLE public.questoes_respondidas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    disciplina VARCHAR(100),
    enunciado TEXT NOT NULL,
    alternativa_escolhida TEXT,
    acertou BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Tabela de Provas
CREATE TABLE public.provas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    disciplina VARCHAR(100) NOT NULL,
    data_prova TIMESTAMP WITH TIME ZONE NOT NULL,
    assuntos TEXT,
    professor_id UUID REFERENCES public.professores(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes_respondidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;

-- Políticas base: Usuários só enxergam seus próprios dados
CREATE POLICY "Alunos visualizam o próprio perfil" ON public.alunos FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Alunos atualizam o próprio perfil" ON public.alunos FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Acesso aos professores" ON public.professores FOR ALL USING (auth.uid() = aluno_id);
CREATE POLICY "Acesso aos materiais" ON public.materiais FOR ALL USING (auth.uid() = aluno_id);
CREATE POLICY "Acesso às conversas" ON public.conversas FOR ALL USING (auth.uid() = aluno_id);
CREATE POLICY "Acesso às questões" ON public.questoes_respondidas FOR ALL USING (auth.uid() = aluno_id);
CREATE POLICY "Acesso às provas" ON public.provas FOR ALL USING (auth.uid() = aluno_id);
