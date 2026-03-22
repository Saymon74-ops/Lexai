import { Loader2 } from 'lucide-react';

export default function LoadingState({ text = 'Carregando dados...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
      <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-4" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}
