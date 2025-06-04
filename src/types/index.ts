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

// Definisi state untuk form generator prompt gambar
export interface ImagePromptFormState {
  subjectType: string;
  subjectDescription: string;
  subjectCount: string;
  subjectAppearanceDetails: string;
  actionDescription: string;
  settingLocation: string;
  settingTime: string;
  settingWeather: string;
  settingAtmosphere: string;
  cameraAngle: string;
  shotDistance: string;
  artisticCategory: string;
  artisticSubStyle: string;
  artistInspiration: string;
  lightingType: string;
  colorPaletteDescription: string;
  dominantColor: string;
  detailLevel: string;
  aspectRatio: string;
  negativePrompt: string;
}

// Definisi untuk prompt yang disimpan (hasil + input)
export interface SavedPrompt {
  id: string; // UUID from Supabase
  user_id: string;
  created_at: string;
  form_input: ImagePromptFormState;
  dall_e_prompt: string;
  midjourney_prompt: string;
  prompt_title?: string | null;
}

export interface GeneratedPrompts { 
  dall_e_prompt: string;
  midjourney_prompt: string;
}

// Definisi state untuk form generator prompt video
export interface VideoPromptFormState {
  sceneDescription: string;
  estimatedDuration: string;
  mainCameraMovement: string;
  cameraMovementSpeed: string;
  videoActionIntensity: string;
  overallVideoMood: string;
  subjectType: string; // Shared with image
  subjectDescription: string; // Shared with image
  settingLocation: string; // Shared with image
  artisticCategory: string; // Shared with image but different options
  aspectRatio: string; // Shared with image but different options
  negativePrompt: string; // Shared with image
}

// Definisi untuk output prompt video yang dihasilkan
export interface GeneratedVideoPrompts {
  kling_ai_veo_format: string;
  chatgpt_video_idea: string;
}

// Definisi untuk prompt video yang disimpan (hasil + input)
export interface SavedVideoPrompt {
  id: string; // UUID from Supabase
  user_id: string;
  created_at: string;
  form_input_video: VideoPromptFormState; // Menyimpan input form video
  kling_ai_veo_prompt: string;
  chatgpt_video_idea_prompt: string;
  prompt_title?: string | null;
}


// Definisi untuk konfigurasi prompt yang disimpan (hanya input form)
export type PromptConfigParameters = ImagePromptFormState | VideoPromptFormState;

export interface UserPromptConfig {
  id: number; // bigint from Supabase, auto-incrementing primary key
  user_id: string;
  config_name: string;
  prompt_type: 'image' | 'video';
  parameters: PromptConfigParameters; // JSONB in Supabase
  created_at: string;
  updated_at: string;
}

// Definisi untuk entri riwayat prompt
export interface PromptHistoryEntry {
  id: number; // bigint from Supabase
  user_id: string;
  prompt_type: 'image' | 'video';
  input_parameters: PromptConfigParameters; // JSONB
  generated_prompts: GeneratedPrompts | GeneratedVideoPrompts; // JSONB
  created_at: string;
}