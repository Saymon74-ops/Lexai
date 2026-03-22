import { CalendarClock } from 'lucide-react';

export default function Provas() {
  return (
    <div className="p-8 text-zinc-50">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <CalendarClock className="w-8 h-8 text-yellow-500" /> Próximas Provas
      </h1>
      <div className="bg-[#202024] border border-zinc-800 rounded-xl p-6">
        <p className="text-zinc-400">Página de cadastro de provas e contagem regressiva em breve.</p>
      </div>
    </div>
  );
}
