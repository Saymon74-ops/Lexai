import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121214] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    // Redireciona para o login salvando a rota original
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
