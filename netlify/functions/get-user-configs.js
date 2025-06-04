
// netlify/functions/get-user-configs.js
import { getSupabaseClient, getUserFromToken } from './_utils/supabaseClient';

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
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
  
  const supabase = getSupabaseClient(token);

  try {
    const { data, error } = await supabase
      .from('user_prompt_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching configs:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to fetch prompt configurations' }) };
    }

    return { statusCode: 200, body: JSON.stringify(data || []) };
  } catch (e) {
    console.error('Unexpected error fetching configs:', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'An unexpected error occurred.' }) };
  }
};
