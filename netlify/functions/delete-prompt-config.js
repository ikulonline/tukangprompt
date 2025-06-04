
// netlify/functions/delete-prompt-config.js
import { getSupabaseClient, getUserFromToken } from './_utils/supabaseClient';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'DELETE') { // Allow POST for simplicity from forms if DELETE is tricky
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

  const { config_id } = body;

  if (!config_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad request: Missing required field (config_id)' }) };
  }
  
  const supabase = getSupabaseClient(token);

  try {
    // Ensure the config belongs to the user before deleting
    const { error: deleteError } = await supabase
      .from('user_prompt_configs')
      .delete()
      .match({ id: config_id, user_id: user.id }); // Crucial: match user_id

    if (deleteError) {
      console.error('Supabase error deleting config:', deleteError);
      // If error is PGRST204 (No Content), it might mean the record wasn't found or didn't match user_id.
      // This could be treated as success or a specific error based on desired behavior.
      if (deleteError.code === 'PGRST204') {
         return { statusCode: 404, body: JSON.stringify({ error: 'Configuration not found or not owned by user.' }) };
      }
      return { statusCode: 500, body: JSON.stringify({ error: deleteError.message || 'Failed to delete prompt configuration' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ message: 'Configuration deleted successfully' }) };
  } catch (e) {
    console.error('Unexpected error deleting config:', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'An unexpected error occurred.' }) };
  }
};
