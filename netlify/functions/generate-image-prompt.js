// netlify/functions/generate-image-prompt.js
import { GoogleGenAI } from "@google/genai";
import { getSupabaseClient, getUserFromToken } from './_utils/supabaseClient';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // API_KEY must be set in Netlify env vars

const logPromptHistoryAsync = async (token, promptType, inputParameters, generatedPromptsData) => {
  console.log('History: logPromptHistoryAsync called.');
  if (!token) {
    console.warn('History: logPromptHistoryAsync - No token provided, aborting history log.');
    return;
  }
  if (!generatedPromptsData || Object.keys(generatedPromptsData).length === 0) {
    console.warn('History: logPromptHistoryAsync - generatedPromptsData is empty or invalid, aborting history log.');
    return;
  }

  try {
    const { user, error: userError } = await getUserFromToken(token);
    if (userError || !user) {
      console.warn('History: Could not log, invalid user token or user not found.', userError ? JSON.stringify(userError) : 'User is null.');
      return;
    }
    console.log('History: User ID for history:', user.id);

    const supabase = getSupabaseClient(token); // Client with user's token for RLS

    console.log('History: Attempting to insert into prompt_history for user:', user.id, 'Prompt Type:', promptType);
    // console.log('History: Input params snippet:', JSON.stringify(inputParameters).substring(0,100));
    // console.log('History: Generated prompts snippet:', JSON.stringify(generatedPromptsData).substring(0,100));


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
    subjectType, subjectDescription, subjectCount, subjectAppearanceDetails,
    actionDescription, settingLocation, settingTime, settingWeather,
    settingAtmosphere, cameraAngle, shotDistance, artisticCategory,
    artisticSubStyle, artistInspiration, lightingType, colorPaletteDescription,
    dominantColor, detailLevel, aspectRatio, negativePrompt
  } = formState;

  const detailedInput = `
    Tipe Subjek: ${subjectType}
    Deskripsi Subjek: ${subjectDescription}
    Jumlah Subjek: ${subjectCount}
    Detail Penampilan Subjek: ${subjectAppearanceDetails || 'Tidak ada'}
    Aksi/Pose: ${actionDescription}
    Lokasi Setting: ${settingLocation}
    Waktu Setting: ${settingTime}
    Cuaca Setting: ${settingWeather || 'Tidak ditentukan'}
    Atmosfer Setting: ${settingAtmosphere}
    Sudut Kamera: ${cameraAngle}
    Jarak Tembak: ${shotDistance}
    Kategori Artistik: ${artisticCategory}
    Sub-Gaya Artistik: ${artisticSubStyle || 'Tidak ada'}
    Inspirasi Seniman: ${artistInspiration || 'Tidak ada'}
    Tipe Pencahayaan: ${lightingType}
    Deskripsi Palet Warna: ${colorPaletteDescription}
    Warna Dominan: ${dominantColor || 'Tidak ditentukan'}
    Tingkat Detail: ${detailLevel}
    Aspect Ratio: ${aspectRatio}
    Prompt Negatif: ${negativePrompt || 'Tidak ada'}
  `;

  const systemInstruction = `Anda adalah asisten ahli dalam membuat prompt untuk model AI generatif gambar seperti DALL-E dan Midjourney. Berdasarkan detail input pengguna, buatkan dua prompt: satu untuk DALL-E (lebih deskriptif dan naratif) dan satu untuk Midjourney (lebih ke kata kunci dan parameter teknis). Kembalikan HANYA objek JSON dengan format {"dall_e_prompt": "...", "midjourney_prompt": "..."}. Jangan tambahkan teks lain atau markdown code fences di luar JSON.`;
  
  const userPrompt = `Berikut adalah detail untuk gambar yang ingin dibuat: ${detailedInput}. Tolong generate prompt DALL-E dan Midjourney.`;

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
      console.log('History: Conditions met for logging image prompt history.');
      logPromptHistoryAsync(token, 'image', formState, generatedPrompts)
        .catch(err => console.error("History: Error during async image log invocation:", err.message, err.stack));
    } else {
      if (!token) {
        console.warn('History: Image logging skipped, token not found.');
      }
      if (!generatedPrompts || Object.keys(generatedPrompts).length === 0) {
        console.warn('History: Image logging skipped, generatedPrompts is null, undefined, or empty. Value:', generatedPrompts);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(generatedPrompts),
    };

  } catch (error) {
    console.error('Error generating image prompt with Gemini:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Gagal menghasilkan prompt gambar via AI.' }),
    };
  }
};