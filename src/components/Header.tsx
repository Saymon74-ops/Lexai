import { useState } from 'react';
import { Bell as BellIcon, Search as SearchIcon, X, Menu } from 'lucide-react';

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 border-b border-zinc-800 bg-[#121214]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 font-sans">
      <div className="flex items-center gap-2 text-zinc-400 w-full sm:w-auto">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-[#202024] rounded-md transition-colors mr-1 focus:outline-none">
          <Menu className="w-5 h-5 text-zinc-50" />
        </button>
        <SearchIcon className="w-4 h-4 hidden sm:block" />
        <input 
          type="text" 
          placeholder="Buscar no app (Ctrl+K)..." 
          className="bg-transparent border-none focus:outline-none text-sm w-full sm:w-64 text-zinc-50 placeholder:text-zinc-500"
        />
      </div>

      <div className="flex items-center gap-3 relative shrink-0">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-full hover:bg-[#202024] transition-colors text-zinc-400 hover:text-zinc-50 focus:outline-none"
        >
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-500"></span>
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className="absolute top-12 right-0 sm:right-12 w-[calc(100vw-2rem)] sm:w-80 bg-[#202024] border border-zinc-700 rounded-lg shadow-2xl p-4 animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-zinc-50 font-bold">Notificações</h3>
              <button onClick={() => setShowNotifications(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-[#121214] p-3 rounded-md border border-zinc-800">
                <p className="text-sm border-l-2 border-yellow-500 pl-2 text-zinc-300">
                  <span className="font-semibold text-white">Bem-vindo(a)!</span><br/>Seu trial de 7 dias foi ativado.
                </p>
              </div>
              <div className="bg-[#121214] p-3 rounded-md border border-zinc-800">
                <p className="text-sm border-l-2 border-green-500 pl-2 text-zinc-300">
                  <span className="font-semibold text-white">Novo Simulado</span><br/>Uma nova prova OAB foi adicionada ao seu painel.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-sm font-medium text-black shadow-lg overflow-hidden border border-yellow-500/20 cursor-pointer">
          <img src="https://ui-avatars.com/api/?name=User&background=EAB308&color=000" alt="User Avatar" />
        </div>
      </div>
    </header>
  );
}
