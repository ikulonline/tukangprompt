

// src/types/index.ts
export interface UserProfile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: string; // 'user' or 'admin'
  updated_at?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioOption {
  value: string;
  label: string;
}