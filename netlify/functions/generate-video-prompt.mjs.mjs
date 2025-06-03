// netlify/functions/generate-video-prompt.mjs
import { GoogleGenAI } from "@google/genai";

// Helper function to construct the detailed instruction for Gemini
const constructGeminiInstructionForVideo = (formState) => {
  // formState here will be an object with keys from VideoPromptFormState
  let instruction = `Anda adalah Pakar Rekayasa Prompt Video AI yang sangat ahli. Tugas Anda adalah menghasilkan dua variasi prompt video berdasarkan detail yang diberikan pengguna.

Pengguna memberikan detail berikut untuk prompt video:
- Deskripsi Adegan Utama / Konsep Video: ${formState.sceneDescription || 'Tidak ada deskripsi spesifik'}
- Estimasi Durasi: ${formState.estimatedDuration || 'Tidak ditentukan'}
- Gerakan Kamera Utama: ${formState.mainCameraMovement || 'Statis'}
- Kecepatan Gerakan Kamera: ${formState.cameraMovementSpeed || 'Sedang'}
- Intensitas Aksi Video: ${formState.videoActionIntensity || 'Sedang'}
- Mood Keseluruhan Video: ${formState.overallVideoMood || 'Tidak ditentukan'}
- Tipe Subjek Utama (Jika Ada): ${formState.subjectType || 'Tidak ditentukan'}
- Deskripsi Subjek Utama (Jika Ada): ${formState.subjectDescription || 'Tidak ada deskripsi spesifik'}
- Lokasi Setting Utama: ${formState.settingLocation || 'Tidak ditentukan'}
- Kategori Umum Gaya Visual: ${formState.artisticCategory || 'Tidak ditentukan'}
- Aspect Ratio Video: ${formState.aspectRatio || '16:9'}
- Prompt Negatif Video (Hal yang Dihindari): ${formState.negativePrompt || 'Tidak ada'}

Tugas Anda:
1.  Buat prompt pertama dengan nama kunci \`kling_ai_veo_format\`. Prompt ini harus **sangat deskriptif, to the point, dan cocok untuk model text-to-video canggih seperti Kling AI, Google Veo, atau Sora**. Fokus pada detail visual, gerakan kamera, subjek, atmosfer, pencahayaan, dan komposisi. Sertakan durasi dan aspect ratio jika relevan. Hindari narasi berlebihan, lebih ke perintah visual.
    Contoh: "Epic cinematic shot: A lone astronaut discovers a glowing alien artifact on a desolate Mars landscape. Camera slowly dollies in on the astronaut's reflective visor showing the artifact. Dust motes float in the crimson sunlight. Duration 10 seconds. Aspect ratio 16:9. Moody, suspenseful atmosphere."

2.  Buat prompt kedua dengan nama kunci \`chatgpt_video_idea\`. Prompt ini harus berupa **deskripsi konsep video yang lebih naratif dan elaboratif**. Cocok untuk diberikan ke model bahasa seperti ChatGPT untuk dikembangkan lebih lanjut menjadi skenario, storyboard, atau ide video yang lebih matang. Fokus pada cerita, mood, dan elemen-elemen kunci yang membangun adegan.
    Contoh: "A short video concept exploring the moment of discovery. An astronaut, isolated on Mars, stumbles upon an alien artifact that pulses with an ethereal light. The scene should build suspense, focusing on the astronaut's reaction mirrored in their helmet's visor. The desolate, red-hued Martian environment contrasts with the artifact's mysterious glow. The video should aim for a duration of about 10 seconds with a 16:9 aspect ratio, conveying a sense of wonder and foreboding."

Pastikan output Anda dalam format JSON yang ketat seperti ini:
{
  "kling_ai_veo_format": "...",
  "chatgpt_video_idea": "..."
}

Analisis input pengguna dengan cermat dan buat prompt video terbaik yang Anda bisa berdasarkan parameter yang diberikan. Pastikan kedua format prompt diisi.
`;
  return instruction;
};


export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error('API_KEY environment variable is not set.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: API key missing.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  let formState;
  try {
    formState = JSON.parse(event.body);
    // Basic validation: ensure essential fields are present, though Gemini can handle missing optional fields.
    if (!formState || typeof formState !== 'object' || !formState.sceneDescription) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request body: Missing sceneDescription or invalid format.' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body: Not valid JSON.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  const instructionForGemini = constructGeminiInstructionForVideo(formState);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: instructionForGemini,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Regex to strip markdown fence
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      // Validate the structure of the parsed data
      if (typeof parsedData.kling_ai_veo_format !== 'string' || typeof parsedData.chatgpt_video_idea !== 'string') {
        console.error("Gemini response doesn't match expected JSON structure for video prompts:", parsedData);
        throw new Error("Format respons dari AI tidak sesuai. Prompt video tidak ditemukan.");
      }
      return {
        statusCode: 200,
        body: JSON.stringify(parsedData),
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (parseError) {
      console.error('Failed to parse JSON response from Gemini for video prompts:', parseError);
      console.error('Original Gemini text for video prompts:', response.text);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Gagal memproses respons dari AI untuk video. Format tidak valid.', details: response.text }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

  } catch (error) {
    console.error('Error calling Gemini API for video prompts:', error);
    let errorMessage = 'Gagal menghubungi layanan AI untuk video.';
    if (error.message) {
        errorMessage += ` Detail: ${error.message}`;
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};