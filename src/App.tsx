import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Overview';
import Questoes from './pages/Questoes';
import Materiais from './pages/Materiais';
import HistoricoWhatsApp from './pages/HistoricoWhatsApp';
import NotFound from './pages/NotFound';
import Onboarding from './pages/Onboarding';
import Perfil from './pages/Perfil';
import Professores from './pages/Professores';
import Provas from './pages/Provas';
import Planos from './pages/Planos';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<Onboarding />} />
            
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Overview />} />
              <Route path="materiais" element={<Materiais />} />
              <Route path="questoes" element={<Questoes />} />
              <Route path="whatsapp" element={<HistoricoWhatsApp />} />
              <Route path="perfil" element={<Perfil />} />
              <Route path="professores" element={<Professores />} />
              <Route path="provas" element={<Provas />} />
              <Route path="planos" element={<Planos />} />
            </Route>
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
