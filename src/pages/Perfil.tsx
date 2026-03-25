import { UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Perfil() {
  const { user, alunoData } = useAuth();
  const [notificationTime, setNotificationTime] = useState('08:00');

  useEffect(() => {
    const savedTime = localStorage.getItem('studyNotificationTime');
    if (savedTime) {
      setNotificationTime(savedTime);
    }
  }, []);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setNotificationTime(time);
    localStorage.setItem('studyNotificationTime', time);
  };
  
  return (
    <div className="p-8 text-zinc-50">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <UserCircle className="w-8 h-8 text-yellow-500" /> Meu Perfil
      </h1>
      <div className="bg-[#202024] border border-zinc-800 rounded-xl p-6 mb-6">
        <p><strong>Nome:</strong> {alunoData?.nome || user?.email}</p>
        <p><strong>Faculdade:</strong> {alunoData?.faculdade || 'Não informada'}</p>
        <p><strong>Período:</strong> {alunoData?.periodo || 'Não informado'}</p>
        <p><strong>Plano Atual:</strong> <span className="text-yellow-500 uppercase">{alunoData?.plano}</span></p>
      </div>
      <div className="bg-[#202024] border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Configurações de Notificação</h2>
        <div className="flex items-center gap-4">
          <label htmlFor="notificationTime" className="text-zinc-300">Horário da notificação diária:</label>
          <input
            type="time"
            id="notificationTime"
            value={notificationTime}
            onChange={handleTimeChange}
            className="bg-zinc-800 border border-zinc-600 rounded px-3 py-1 text-zinc-50"
          />
        </div>
      </div>
    </div>
  );
}
