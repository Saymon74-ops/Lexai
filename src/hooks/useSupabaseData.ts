import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSupabaseData<T>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user?.id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: result, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('aluno_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (result) setData(result as T[]);
      } catch (err) {
        console.error(`Erro ao buscar dados de ${tableName}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('public:' + tableName)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session, tableName]);

  return { data, loading, setData };
}
