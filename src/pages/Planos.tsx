import { CreditCard, Check } from 'lucide-react';

export default function Planos() {
  return (
    <div className="p-8 text-zinc-50">
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <CreditCard className="w-8 h-8 text-yellow-500" /> Planos e Preços
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Grátis */}
        <div className="bg-[#202024] border border-zinc-800 rounded-xl p-8 flex flex-col">
          <h2 className="text-xl font-bold mb-2">Plano Grátis</h2>
          <div className="text-3xl font-bold mb-6">R$ 0<span className="text-sm text-zinc-500 font-normal">/mês</span></div>
          <ul className="mb-8 space-y-3 flex-1 text-zinc-400">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 10 questões/mês</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Resumos básicos</li>
          </ul>
          <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors font-semibold">
            Plano Atual
          </button>
        </div>

        {/* Estudante */}
        <div className="bg-[#2a2a2e] border-2 border-yellow-500 rounded-xl p-8 flex flex-col relative transform scale-105 shadow-2xl shadow-yellow-500/10">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Mais Popular
          </div>
          <h2 className="text-xl font-bold mb-2 text-yellow-500">Estudante</h2>
          <div className="text-3xl font-bold mb-6">R$ 47<span className="text-sm text-zinc-500 font-normal text-zinc-400">/mês</span></div>
          <ul className="mb-8 space-y-3 flex-1 text-zinc-300">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-yellow-500" /> Questões ilimitadas</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-yellow-500" /> IA para resumos avançados</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-yellow-500" /> Histórico do WhatsApp</li>
          </ul>
          <button className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-md transition-colors font-bold">
            Assinar Estudante
          </button>
        </div>

        {/* OAB */}
        <div className="bg-[#202024] border border-zinc-800 rounded-xl p-8 flex flex-col">
          <h2 className="text-xl font-bold mb-2 text-blue-400">Foco OAB</h2>
          <div className="text-3xl font-bold mb-6">R$ 97<span className="text-sm text-zinc-500 font-normal">/mês</span></div>
          <ul className="mb-8 space-y-3 flex-1 text-zinc-400">
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Tudo do plano Estudante</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Simulados inéditos OAB</li>
            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400" /> Mentoria IA 24/7</li>
          </ul>
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors font-semibold">
            Assinar Foco OAB
          </button>
        </div>
      </div>
    </div>
  );
}
