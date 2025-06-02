import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Supabase URL or Anon Key is missing. ' +
    'Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting environment variables (e.g., Netlify).';
  console.error(errorMessage);
  // Display error to the user as well if possible, or halt execution
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif; text-align: center;">
      <h1>Konfigurasi Error</h1>
      <p>${errorMessage}</p>
      <p>Silakan periksa pengaturan variabel lingkungan di platform hosting Anda.</p>
    </div>`;
  }
  throw new Error(errorMessage);
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);