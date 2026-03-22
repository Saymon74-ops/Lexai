import { UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Perfil() {
  const { user, alunoData } = useAuth();
  
  return (
    <div className="p-8 text-zinc-50">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UserCircle className="w-8 h-8 text-yellow-500" /> Meu Perfil
      </h1>
      <div className="bg-[#202024] border border-zinc-800 rounded-xl p-6">
        <p><strong>Nome:</strong> {alunoData?.nome || user?.email}</p>
        <p><strong>Faculdade:</strong> {alunoData?.faculdade || 'Não informada'}</p>
        <p><strong>Período:</strong> {alunoData?.periodo || 'Não informado'}</p>
        <p><strong>Plano Atual:</strong> <span className="text-yellow-500 uppercase">{alunoData?.plano}</span></p>
      </div>
    </div>
  );
}
