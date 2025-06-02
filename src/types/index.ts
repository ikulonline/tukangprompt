// src/types/index.ts
export interface UserProfile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: string; // 'user' or 'admin'
  updated_at?: string;
}
