import { GoogleGenAI } from "@google/genai";

// Helper function to construct the detailed instruction for Gemini
const constructGeminiInstruction = (formState) => {
  let instruction = `Anda adalah Pakar Rekayasa Prompt AI yang sangat ahli. Tugas Anda adalah menghasilkan dua variasi prompt gambar berdasarkan detail yang diberikan pengguna.

Pengguna memberikan detail berikut:
- Tipe Subjek: ${formState.subjectType || 'Tidak ditentukan'}
- Deskripsi Subjek: ${formState.subjectDescription || 'Tidak ada deskripsi spesifik'}
- Jumlah Subjek: ${formState.subjectCount || 'Satu'}
- Detail Penampilan Subjek: ${formState.subjectAppearanceDetails || 'Tidak ada'}
- Aksi/Pose: ${formState.actionDescription || 'Tidak ada aksi spesifik'}
- Lokasi Setting: ${formState.settingLocation || 'Tidak ditentukan'}
- Waktu Setting: ${formState.settingTime || 'Siang'}
- Cuaca Setting: ${formState.settingWeather || 'Tidak ditentukan'}
- Atmosfer Setting: ${formState.settingAtmosphere || 'Tidak ditentukan'}
- Sudut Kamera: ${formState.cameraAngle || 'Eye-level'}
- Jarak Tembak: ${formState.shotDistance || 'Medium shot'}
- Kategori Gaya Artistik: ${formState.artisticCategory || 'Tidak ditentukan'}
- Sub-Gaya Artistik: ${formState.artisticSubStyle || 'Tidak ada'}
- Inspirasi Seniman: ${formState.artistInspiration || 'Tidak ada'}
- Tipe Pencahayaan: ${formState.lightingType || 'Tidak ditentukan'}
- Deskripsi Palet Warna: ${formState.colorPaletteDescription || 'Tidak ditentukan'}
- Warna Dominan: ${formState.dominantColor || 'Tidak ada'}
- Tingkat Detail: ${formState.detailLevel || 'Sedang'}
- Aspect Ratio yang diinginkan: ${formState.aspectRatio || '1:1'}
- Prompt Negatif (hal yang dihindari): ${formState.negativePrompt || 'Tidak ada'}

Tugas Anda:
1.  Buat prompt pertama yang **sangat deskriptif dan umum**, cocok untuk model seperti DALL-E, Stable Diffusion, atau model generatif gambar umum lainnya. Prompt ini harus menggabungkan semua detail relevan menjadi narasi yang kaya dan visual. Fokus pada deskripsi adegan, subjek, atmosfer, pencahayaan, dan komposisi. Jangan sertakan parameter model spesifik (seperti --ar).

2.  Buat prompt kedua yang **dioptimalkan untuk Midjourney**. Prompt ini harus lebih ringkas, menggunakan kata kunci yang kuat, dan menyertakan parameter Midjourney yang umum jika relevan.
    *   Gunakan detail dari `aspectRatio` untuk parameter \`--ar\` (misalnya, \`--ar ${formState.aspectRatio || '1:1'}\`).
    *   Jika gaya artistik atau inspirasi seniman disebutkan, coba refleksikan itu dalam gaya Midjourney.
    *   Anda bisa menambahkan parameter lain yang umum digunakan di Midjourney jika dirasa sesuai, misalnya \`--v 6.0\` (atau versi terbaru yang Anda ketahui), atau parameter gaya seperti \`--style raw\` atau \`--stylize\` (jika relevan).
    *   Sertakan prompt negatif di akhir dengan parameter \`--no\` jika ada. Contoh: \`--no ${formState.negativePrompt}\`

Pastikan output Anda dalam format JSON yang ketat seperti ini:
{
  "dall_e_prompt": "...",
  "midjourney_prompt": "..."
}

Contoh bagian dari `dall_e_prompt`: "Sebuah lukisan digital epik dari seorang ksatria tua dengan armor perak berukir, berdiri gagah di puncak gunung bersalju saat fajar. Cahaya keemasan lembut menyinari wajahnya yang bijaksana, memperlihatkan bekas luka di pipi. Di kejauhan, naga merah terbang melintasi langit mendung. Gaya fotorealistis dengan detail tinggi, sudut pandang rendah."

Contoh bagian dari `midjourney_prompt`: "epic knight, old, silver ornate armor, wise eyes, scar on cheek, mountaintop, snowy, sunrise, golden hour, red dragon flying, low angle shot, hyperrealistic, detailed --ar ${formState.aspectRatio || '1:1'} --v 6.0 --style raw --no blurry, low quality"

Analisis input pengguna dengan cermat dan buat prompt terbaik yang Anda bisa.
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
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body: Not valid JSON.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }

  if (!formState || typeof formState !== 'object') {
     return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body: Form data missing or not an object.' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }


  const ai = new GoogleGenAI({ apiKey });
  const instructionForGemini = constructGeminiInstruction(formState);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17", // Updated model
      contents: instructionForGemini,
      config: {
        responseMimeType: "application/json",
        // Consider disabling thinking if ultra-low latency is critical and form provides very structured input
        // thinkingConfig: { thinkingBudget: 0 } 
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsedData = JSON.parse(jsonStr);
      if (typeof parsedData.dall_e_prompt !== 'string' || typeof parsedData.midjourney_prompt !== 'string') {
        console.error("Gemini response doesn't match expected JSON structure:", parsedData);
        throw new Error("Format respons dari AI tidak sesuai. Prompt DALL-E atau Midjourney tidak ditemukan.");
      }
      return {
        statusCode: 200,
        body: JSON.stringify(parsedData),
        headers: { 'Content-Type': 'application/json' },
      };
    } catch (parseError) {
      console.error('Failed to parse JSON response from Gemini:', parseError);
      console.error('Original Gemini text:', response.text);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Gagal memproses respons dari AI. Format tidak valid.', details: response.text }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    let errorMessage = 'Gagal menghubungi layanan AI.';
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