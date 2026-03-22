import { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, Search, HelpCircle, X } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import LoadingState from '../components/LoadingState';

export default function Questoes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestao, setSelectedQuestao] = useState<any | null>(null);
  
  const { data: questoes, loading } = useSupabaseData<any>('questoes_respondidas');

  const filteredQuestoes = useMemo(() => {
    if (!questoes) return [];
    return questoes.filter(q => 
      q.disciplina?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.enunciado?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, questoes]);

  const totalRespondidas = questoes?.length || 0;
  const acertos = questoes?.filter(q => q.acertou)?.length || 0;
  const erros = totalRespondidas - acertos;
  const taxaAcerto = totalRespondidas > 0 ? Math.round((acertos / totalRespondidas) * 100) : 0;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Questões Resolvidas</h1>
          <p className="text-zinc-400 text-sm">Acompanhe seu desempenho nas questões geradas e extraídas.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por disciplina ou enunciado..."
              className="w-full bg-[#121214] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-50 focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#202024] border border-zinc-800 rounded-xl p-4">
          <div className="text-sm text-zinc-400 mb-1">Total Resolvidas</div>
          <div className="text-2xl font-bold text-zinc-50">{loading ? '...' : totalRespondidas}</div>
        </div>
        <div className="bg-[#202024] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-400 mb-1">Acertos</div>
            <div className="text-2xl font-bold text-green-500">{loading ? '...' : acertos}</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-green-500/20" />
        </div>
        <div className="bg-[#202024] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-zinc-400 mb-1">Erros</div>
            <div className="text-2xl font-bold text-red-500">{loading ? '...' : erros}</div>
          </div>
          <XCircle className="w-8 h-8 text-red-500/20" />
        </div>
        <div className="bg-[#202024] border border-zinc-800 rounded-xl p-4">
          <div className="text-sm text-zinc-400 mb-1">Taxa de Acerto</div>
          <div className="text-2xl font-bold text-zinc-50">{loading ? '...' : taxaAcerto}%</div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 bg-[#202024] border border-zinc-800 rounded-xl">
            <LoadingState text="Carregando suas questões resolvidos do Supabase..." />
          </div>
        ) : filteredQuestoes.length === 0 ? (
          <div className="text-center p-8 bg-[#202024] border border-zinc-800 rounded-lg text-zinc-400">
            Nenhuma questão encontrada.
          </div>
        ) : (
          filteredQuestoes.map((q) => (
            <div key={q.id} className="bg-[#202024] border border-zinc-800 rounded-xl p-5 hover:border-yellow-500/30 transition-colors flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {q.acertou ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#121214] border border-zinc-800 text-zinc-400 uppercase tracking-wider">
                      {q.disciplina}
                    </span>
                    <span className="text-xs text-zinc-400">· {new Date(q.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <h3 className="text-white font-medium line-clamp-2 text-sm mb-2">{q.enunciado}</h3>
                  <p className="text-xs text-zinc-500">Sua alternativa: {q.alternativa_escolhida}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => setSelectedQuestao(q)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[#121214] border border-zinc-800 text-zinc-300 hover:text-yellow-500 hover:border-yellow-500/50 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Justificativa */}
      {selectedQuestao && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#202024] border border-zinc-800 rounded-xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <HelpCircle className="w-5 h-5 text-yellow-500" />
                Detalhes da Questão
              </h2>
              <button 
                onClick={() => setSelectedQuestao(null)} 
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 space-y-4">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#121214] border border-zinc-800 text-zinc-400 uppercase tracking-wider inline-block">
                {selectedQuestao.disciplina}
              </span>
              
              <p className="text-zinc-300 text-sm leading-relaxed p-3 bg-[#121214] rounded-lg border border-zinc-800">
                <strong className="text-yellow-500 block mb-1">Enunciado:</strong>
                {selectedQuestao.enunciado}
              </p>

              <p className="text-zinc-300 text-sm p-3 bg-[#121214] rounded-lg border border-zinc-800">
                <strong className="block mb-1 text-zinc-400">Sua Alternativa Escolhida:</strong>
                {selectedQuestao.alternativa_escolhida}
              </p>

              <div className={`p-4 rounded-lg border ${selectedQuestao.acertou ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                <strong>Resultado: </strong>
                {selectedQuestao.acertou ? 'Você Acertou!' : 'Você Errou.'}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedQuestao(null)}
                className="px-4 py-2 bg-[#121214] border border-zinc-800 hover:bg-zinc-800 text-white rounded-md transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
