import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bot, BookOpen, CheckCircle, Scale, LogOut, UserCircle, Users, CalendarClock, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Bot, label: 'Chat IA', path: '/chat' },
  { icon: BookOpen, label: 'Materiais', path: '/materiais' },
  { icon: CheckCircle, label: 'Questões', path: '/questoes' },
  { icon: CalendarClock, label: 'Próximas Provas', path: '/provas' },
  { icon: Users, label: 'Professores', path: '/professores' },
  { icon: UserCircle, label: 'Meu Perfil', path: '/perfil' },
  { icon: CreditCard, label: 'Planos e Preços', path: '/planos' },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#121214] border-r border-zinc-800 flex flex-col h-full font-sans">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
          <Scale className="w-6 h-6 text-yellow-500" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
          LexIA
        </span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-800">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-yellow-500/10 text-yellow-500 font-medium'
                  : 'text-zinc-400 hover:text-zinc-50 hover:bg-[#202024]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 justify-center w-full px-4 py-2 text-sm text-zinc-400 hover:text-red-400 hover:bg-[#202024] rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
