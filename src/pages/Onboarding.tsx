import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    faculdade: '',
    periodo: ''
  });

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFormData(prev => ({ ...prev, nome: user.user_metadata.full_name }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('alunos')
        .update({
          nome: formData.nome,
          faculdade: formData.faculdade,
          periodo: parseInt(formData.periodo) || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] flex flex-col items-center justify-center p-6 text-zinc-50">
      <div className="w-full max-w-md p-8 bg-[#202024] rounded-xl border border-yellow-500/20 shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-2">Bem-vindo(a) ao Lexia!</h1>
        <p className="text-zinc-400 text-center mb-8">Para começarmos, conte-nos um pouco sobre você.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Seu Nome</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full p-3 bg-[#121214] border border-zinc-800 rounded-md focus:outline-none focus:border-yellow-500 text-white"
              placeholder="Ex: João da Silva"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Faculdade (opcional)</label>
            <input
              type="text"
              value={formData.faculdade}
              onChange={(e) => setFormData({ ...formData, faculdade: e.target.value })}
              className="w-full p-3 bg-[#121214] border border-zinc-800 rounded-md focus:outline-none focus:border-yellow-500 text-white"
              placeholder="Ex: USP, FGV..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Período (opcional)</label>
            <input
              type="number"
              min="1"
              max="12"
              value={formData.periodo}
              onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
              className="w-full p-3 bg-[#121214] border border-zinc-800 rounded-md focus:outline-none focus:border-yellow-500 text-white"
              placeholder="Ex: 5"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-md transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Começar a estudar'}
          </button>
        </form>
      </div>
    </div>
  );
}
