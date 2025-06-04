// netlify/functions/get-prompt-history.js
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
  
  const supabase = getSupabaseClient(token); // User context for RLS

  try {
    const { data, error } = await supabase
      .from('prompt_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching prompt history:', error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Gagal mengambil riwayat prompt.' }) };
    }

    return { statusCode: 200, body: JSON.stringify(data || []) };
  } catch (e) {
    console.error('Unexpected error fetching prompt history:', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Terjadi kesalahan tak terduga.' }) };
  }
};