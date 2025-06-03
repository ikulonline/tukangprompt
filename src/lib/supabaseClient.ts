

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Placeholder values for environments where .env might not be accessible
const PLACEHOLDER_SUPABASE_URL = 'http://localhost:54321'; // A common local Supabase URL format
const PLACEHOLDER_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'; // A valid-looking but non-functional anon key

let supabaseUrl: string | undefined;
let supabaseAnonKey: string | undefined;

// Try to access Vite environment variables
if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
}

// If environment variables are not found or are empty, use placeholders
if (!supabaseUrl || supabaseUrl.trim() === '' || !supabaseAnonKey || supabaseAnonKey.trim() === '') {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) not found or are empty. ' +
    'Using placeholder values for Supabase client initialization. ' +
    'Actual Supabase functionality will not work. ' +
    'Please ensure these variables are correctly set in your .env file for local development or in your hosting environment.'
  );
  supabaseUrl = PLACEHOLDER_SUPABASE_URL;
  supabaseAnonKey = PLACEHOLDER_SUPABASE_ANON_KEY;
}

// Final check to ensure that after potential placeholder assignment, the values are valid for client creation.
// This check is more for structural integrity before calling createClient.
if (typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '' || typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '') {
  const errorMessage = 'Supabase URL or Anon Key is critically missing or invalid even after attempting to use placeholders. ' +
    'This indicates a fundamental issue with the environment setup or the placeholder logic. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are properly configured.';
  console.error(errorMessage);
  
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif; text-align: center; background-color: #fff1f2; border: 1px solid #ffccd5;">
      <h1 style="color: #b91c1c; font-size: 1.5rem;">Kesalahan Konfigurasi Kritis</h1>
      <p style="color: #c2410c; font-size: 1rem;">${errorMessage}</p>
      <p style="color: #7f1d1d; font-size: 0.9rem;">Aplikasi tidak dapat berjalan tanpa konfigurasi ini. Silakan periksa pengaturan variabel lingkungan Anda atau laporkan masalah ini jika Anda bukan developer.</p>
    </div>`;
  }
  // This throw will halt execution if Supabase keys are still unusable.
  throw new Error(errorMessage);
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);