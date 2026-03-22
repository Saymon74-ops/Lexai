import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center text-zinc-50 font-sans p-6 text-center">
      <div className="text-yellow-500 mb-6">
        <ShieldAlert className="w-24 h-24 mx-auto" strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl font-bold mb-4">404 - Página Não Encontrada</h1>
      <p className="text-zinc-400 mb-8 max-w-md text-lg">
        Desculpe, não conseguimos encontrar a página que você está procurando no Lexia.
      </p>
      <Link 
        to="/"
        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-md transition-colors"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
