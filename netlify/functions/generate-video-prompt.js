// netlify/functions/generate-video-prompt.js
import { GoogleGenAI } from "@google/genai";
import { getSupabaseClient, getUserFromToken } from './_utils/supabaseClient';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // API_KEY must be set in Netlify env vars

const logPromptHistoryAsync = async (token, promptType, inputParameters, generatedPromptsData) => {
  if (!token) return;

  try {
    const { user, error: userError } = await getUserFromToken(token);
    if (userError || !user) {
      console.warn('History: Could not log, invalid user token or user not found.', userError?.message);
      return;
    }
    
    const supabase = getSupabaseClient(token);

    const { error: historyError } = await supabase
      .from('prompt_history')
      .insert([{
        user_id: user.id,
        prompt_type: promptType,
        input_parameters: inputParameters,
        generated_prompts: generatedPromptsData,
      }]);

    if (historyError) {
      console.error('History: Error saving to prompt_history:', historyError.message);
    } else {
      // console.log('History: Video prompt history saved for user:', user.id);
    }
  } catch (e) {
    console.error('History: Unexpected error in logPromptHistoryAsync:', e.message);
  }
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let formState;
  try {
    formState = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad request: Invalid JSON body' }) };
  }

  const {
    sceneDescription, estimatedDuration, mainCameraMovement, cameraMovementSpeed,
    videoActionIntensity, overallVideoMood, subjectType, subjectDescription,
    settingLocation, artisticCategory, aspectRatio, negativePrompt
  } = formState;

  const detailedInput = `
    Deskripsi Adegan Utama: ${sceneDescription}
    Estimasi Durasi: ${estimatedDuration}
    Gerakan Kamera Utama: ${mainCameraMovement}
    Kecepatan Gerakan Kamera: ${cameraMovementSpeed}
    Intensitas Aksi: ${videoActionIntensity}
    Mood Video Keseluruhan: ${overallVideoMood}
    Tipe Subjek (jika ada): ${subjectType || 'Tidak ada'}
    Deskripsi Subjek (jika ada): ${subjectDescription || 'Tidak ada'}
    Lokasi Setting: ${settingLocation || 'Tidak ditentukan'}
    Kategori Artistik Video: ${artisticCategory}
    Aspect Ratio: ${aspectRatio}
    Prompt Negatif: ${negativePrompt || 'Tidak ada'}
  `;

  const systemInstruction = `Anda adalah asisten ahli dalam membuat prompt untuk model AI generatif video seperti Kling AI atau Google Veo, dan juga untuk menghasilkan ide konsep video untuk ChatGPT. Berdasarkan detail input pengguna, buatkan dua output: pertama, prompt video yang dioptimalkan untuk Kling/Veo (fokus pada deskripsi visual, gerakan, dan gaya sinematik), dan kedua, deskripsi ide video yang lebih naratif untuk ChatGPT yang bisa digunakan untuk brainstorming atau script. Kembalikan HANYA objek JSON dengan format {"kling_ai_veo_format": "...", "chatgpt_video_idea": "..."}. Jangan tambahkan teks lain atau markdown code fences di luar JSON.`;

  const userPrompt = `Berikut adalah detail untuk video yang ingin dibuat: ${detailedInput}. Tolong generate prompt format Kling/Veo dan ide video untuk ChatGPT.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const generatedPrompts = JSON.parse(jsonStr);

    // Log history (non-blocking)
    const token = event.headers.authorization?.split('Bearer ')[1];
    if (token && generatedPrompts) {
       logPromptHistoryAsync(token, 'video', formState, generatedPrompts)
        .catch(err => console.error("History: Error during async video log:", err.message));
    }

    return {
      statusCode: 200,
      body: JSON.stringify(generatedPrompts),
    };

  } catch (error) {
    console.error('Error generating video prompt with Gemini:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Gagal menghasilkan prompt video via AI.' }),
    };
  }
};