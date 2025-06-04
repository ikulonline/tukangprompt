
// netlify/functions/_utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = (accessToken) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL or Anon Key is not configured in Netlify environment variables.');
  }

  const supabaseOptions = {};
  if (accessToken) {
    supabaseOptions.global = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, supabaseOptions);
};

// Helper to get user from JWT.
// IMPORTANT: For a production app, use a proper JWT library to verify the token'
// and ensure it's not tampered with, especially if you're not just passing it to Supabase
// which does its own verification.
// For this context, Supabase client itself will validate the token when making requests.
// This is a simplified helper for extracting user context if needed by the function logic itself.
const getUserFromToken = async (accessToken) => {
  if (!accessToken) {
    return { user: null, error: { message: 'No access token provided.'} };
  }
  // Create a client instance with the user's token to get user details
  const supabase = getSupabaseClient(accessToken);
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};


export { getSupabaseClient, getUserFromToken };
