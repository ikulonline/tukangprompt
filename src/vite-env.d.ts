

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // You can add other custom environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}