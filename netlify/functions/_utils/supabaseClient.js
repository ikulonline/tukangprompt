// netlify/functions/_utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = (accessToken) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Supabase URL or Anon Key is not configured in Netlify environment variables.');
    throw new Error('Server configuration error: Supabase credentials missing.');
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

const getUserFromToken = async (accessToken) => {
  console.log('AuthUtil: getUserFromToken called.');
  if (!accessToken) {
    console.warn('AuthUtil: No access token provided to getUserFromToken.');
    return { user: null, error: { message: 'No access token provided.'} };
  }
  
  const supabase = getSupabaseClient(accessToken); // Creates client with user's token
  console.log('AuthUtil: Supabase client for getUser created. Attempting supabase.auth.getUser().');
  
  let userResult, errorResult;
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    userResult = authData?.user || null;
    errorResult = authError || null;
    console.log('AuthUtil: supabase.auth.getUser() completed.', 'User found:', !!userResult, 'Error:', errorResult ? JSON.stringify(errorResult) : null);
  } catch (e) {
    console.error('AuthUtil: Exception during supabase.auth.getUser():', e.message, e.stack);
    return { user: null, error: { message: 'Exception during token user retrieval: ' + e.message } };
  }
  
  if (errorResult) {
    console.error('AuthUtil: Error getting user from token (from auth.getUser):', errorResult.message);
  }
  if (!userResult) {
    console.warn('AuthUtil: No user object found for the provided token (from auth.getUser).');
  }
  console.log('AuthUtil: getUserFromToken returning.');
  return { user: userResult, error: errorResult };
};

export { getSupabaseClient, getUserFromToken };