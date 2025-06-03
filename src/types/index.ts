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

// Definisi untuk prompt yang disimpan
export interface SavedPrompt {
  id: string;
  user_id: string;
  created_at: string;
  form_input: ImagePromptFormState; // Menggunakan tipe ImagePromptFormState yang sudah didefinisikan
  dall_e_prompt: string;
  midjourney_prompt: string;
  prompt_title?: string | null;
}

export interface GeneratedPrompts { 
  dall_e_prompt: string;
  midjourney_prompt: string;
}

// BARU: Definisi state untuk form generator prompt video
export interface VideoPromptFormState {
  sceneDescription: string; // Deskripsi Adegan Utama / Konsep Video
  estimatedDuration: string; // Estimasi Durasi
  mainCameraMovement: string; // Gerakan Kamera Utama
  cameraMovementSpeed: string; // Kecepatan Gerakan Kamera
  videoActionIntensity: string; // Intensitas Aksi Video
  overallVideoMood: string; // Mood Keseluruhan Video
  // Tambahkan parameter lain dari ImagePromptFormState yang relevan jika diperlukan
  subjectType: string;
  subjectDescription: string;
  settingLocation: string;
  artisticCategory: string;
  aspectRatio: string; // Mungkin relevan juga untuk video
  negativePrompt: string;
}

// BARU: Definisi untuk output prompt video yang dihasilkan
export interface GeneratedVideoPrompts {
  kling_ai_veo_format: string; // Contoh format untuk model video
  chatgpt_video_idea: string;   // Contoh deskripsi ide untuk model bahasa
}
