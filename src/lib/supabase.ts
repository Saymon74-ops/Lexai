import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("=== DEBUG SUPABASE ENV ===");
console.log("VITE_SUPABASE_URL:", supabaseUrl ? "Encontrado" : "NÃO Definido");
console.log("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Encontrado" : "NÃO Definido");
console.log("URL Atual do Projeto:", supabaseUrl);
console.log("==========================");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ ERRO CRÍTICO: As chaves do Supabase não foram encontradas. Verifique se o arquivo .env existe e possui as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(
  supabaseUrl || 'https://projeto-ficticio.supabase.co', 
  supabaseAnonKey || 'chave-ficticia'
)
