import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#202024] border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
            <Scale className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-zinc-50 mb-2">Bem-vindo ao LexIA</h1>
        <p className="text-zinc-400 text-center text-sm mb-6">Acesse sua plataforma inteligente de estudos de Direito.</p>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#EAB308',
                  brandAccent: '#CA8A04',
                  inputText: 'white',
                  inputBackground: '#121214',
                  inputBorder: '#27272A',
                  defaultButtonBackground: '#121214',
                  defaultButtonBackgroundHover: '#27272A',
                }
              }
            },
            style: {
              button: { borderRadius: '0.5rem', padding: '10px 15px', fontWeight: 'bold' },
              input: { borderRadius: '0.5rem' },
            }
          }}
          providers={['google']}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mail',
                password_label: 'Senha',
                email_input_placeholder: 'seu@email.com',
                password_input_placeholder: 'Sua senha',
                button_label: 'Entrar',
                loading_button_label: 'Entrando...',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: 'Já tem uma conta? Entre aqui'
              },
              sign_up: {
                email_label: 'E-mail',
                password_label: 'Senha',
                email_input_placeholder: 'seu@email.com',
                password_input_placeholder: 'Sua senha',
                button_label: 'Criar conta',
                loading_button_label: 'Criando conta...',
                social_provider_text: 'Criar conta com {{provider}}',
                link_text: 'Não tem uma conta? Cadastre-se'
              }
            }
          }}
          theme="dark"
        />
      </div>
    </div>
  );
}
