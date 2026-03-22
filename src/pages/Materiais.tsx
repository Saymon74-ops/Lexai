import { useState, useMemo } from 'react';
import { Search, BookOpen, Clock, Download } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import LoadingState from '../components/LoadingState';

export default function Materiais() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: materiais, loading } = useSupabaseData<any>('materiais');

  const filteredMateriais = useMemo(() => {
    if (!materiais) return [];
    return materiais.filter(m => 
      m.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tipo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, materiais]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">Biblioteca de Materiais</h1>
          <p className="text-zinc-400 text-sm">Acesse os resumos e áudios gerados pela LexIA.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar materiais..."
              className="w-full bg-[#121214] border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-50 focus:outline-none focus:border-yellow-500 transition-colors placeholder:text-zinc-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#202024] border border-zinc-800 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="py-20">
            <LoadingState text="Buscando seus materiais no Supabase..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#121214] text-zinc-400 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Nome do Material</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredMateriais.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-400">
                      Nenhum material encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredMateriais.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-yellow-500/10">
                            <BookOpen className="w-4 h-4 text-yellow-500" />
                          </div>
                          <span className="font-medium text-white">{item.titulo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-[#121214] rounded-md text-xs border border-zinc-800 text-zinc-400">
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-yellow-500 hover:text-yellow-400 font-medium text-sm flex items-center gap-1.5 ml-auto">
                          <Download className="w-4 h-4" />
                          Baixar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
