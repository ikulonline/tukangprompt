// netlify/functions/generate-video-prompt.js
import { GoogleGenAI } from "@google/genai";
import { getSupabaseClient, getUserFromToken } from './_utils/supabaseClient';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // API_KEY must be set in Netlify env vars

const logPromptHistoryAsync = async (token, promptType, inputParameters, generatedPromptsData) => {
  console.log('History: logPromptHistoryAsync called. Token available:', !!token, "Generated prompts data available:", !!generatedPromptsData && Object.keys(generatedPromptsData).length > 0);
  if (!token) {
    console.warn('History: logPromptHistoryAsync - No token provided, aborting history log.');
    return;
  }
  if (!generatedPromptsData || Object.keys(generatedPromptsData).length === 0) {
    console.warn('History: logPromptHistoryAsync - generatedPromptsData is empty or invalid, aborting history log.');
    return;
  }
  
  try {
    console.log('History: About to call getUserFromToken.');
    const { user, error: userError } = await getUserFromToken(token);
    console.log('History: getUserFromToken returned.', 'User object present:', !!user, 'Error object present:', !!userError);
    if (userError) console.log('History: userError details:', JSON.stringify(userError));
    if (user) console.log('History: user.id (if user object exists):', user.id);


    if (userError || !user) {
      console.warn('History: Condition (userError || !user) is TRUE. Logging details before return:');
      console.warn('History: userError object:', userError ? JSON.stringify(userError) : 'null/undefined');
      console.warn('History: user object is falsy:', !user);
      return;
    }
    
    console.log('History: User ID for history (post-check):', user.id);

    const supabase = getSupabaseClient(token);

    console.log('History: Attempting to insert into prompt_history for user:', user.id, 'Prompt Type:', promptType);
    
    const { error: historyError } = await supabase
      .from('prompt_history')
      .insert([{
        user_id: user.id,
        prompt_type: promptType,
        input_parameters: inputParameters,
        generated_prompts: generatedPromptsData,
      }]);

    if (historyError) {
      console.error('History: Error saving to prompt_history:', JSON.stringify(historyError));
    } else {
      console.log('History: Prompt history saved successfully for user:', user.id, 'Type:', promptType);
    }
  } catch (e) {
    console.error('History: Unexpected error in logPromptHistoryAsync:', e.message, e.stack);
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

    let generatedPrompts;
    try {
      generatedPrompts = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Error parsing JSON from Gemini:", parseError, "Original string:", jsonStr);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Gagal memproses respons dari AI. Format tidak valid.' }),
      };
    }

    // Log history (non-blocking)
    const token = event.headers.authorization?.split('Bearer ')[1];
    if (token && generatedPrompts && Object.keys(generatedPrompts).length > 0) {
      console.log('History: Conditions met for logging video prompt history.');
       logPromptHistoryAsync(token, 'video', formState, generatedPrompts)
        .catch(err => console.error("History: Error during async video log invocation:", err.message, err.stack));
    } else {
      if (!token) {
        console.warn('History: Video logging skipped, token not found.');
      }
      if (!generatedPrompts || Object.keys(generatedPrompts).length === 0) {
        console.warn('History: Video logging skipped, generatedPrompts is null, undefined, or empty. Value:', generatedPrompts);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(generatedPrompts),
    };

  } catch (error) {
    console.error('Error generating video prompt with Gemini:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Gagal menghasilkan prompt video via AI.' }),
    };
  }
};