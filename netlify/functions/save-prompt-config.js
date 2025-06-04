
// netlify/functions/save-prompt-config.js
import { getSupabaseClient, getUserFromToken } from './_utils/supabaseClient';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const token = event.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized: No token provided' }) };
  }

  const { user, error: userError } = await getUserFromToken(token);

  if (userError || !user) {
    return { statusCode: 401, body: JSON.stringify({ error: userError?.message || 'Unauthorized: Invalid token' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad request: Invalid JSON body' }) };
  }

  const { config_name, prompt_type, parameters } = body;

  if (!config_name || !prompt_type || !parameters) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad request: Missing required fields (config_name, prompt_type, parameters)' }) };
  }

  if (prompt_type !== 'image' && prompt_type !== 'video') {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad request: Invalid prompt_type. Must be "image" or "video".' }) };
  }
  
  const supabase = getSupabaseClient(token);

  try {
    const { data, error } = await supabase
      .from('user_prompt_configs')
      .insert([{ 
        user_id: user.id, 
        config_name, 
        prompt_type, 
        parameters 
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error saving config:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to save prompt configuration' }) };
    }

    return { statusCode: 201, body: JSON.stringify(data) };
  } catch (e) {
    console.error('Unexpected error saving config:', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'An unexpected error occurred.' }) };
  }
};
