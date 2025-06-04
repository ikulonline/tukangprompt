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
  
  let userResult, errorResult;
  try {
    // Create a new client instance specifically for this auth call
    // This uses the more direct supabase.auth.getUser(tokenString) method
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('AuthUtil: SUPABASE_URL or SUPABASE_ANON_KEY missing for direct client creation in getUserFromToken.');
      throw new Error('Server configuration error: Supabase credentials missing for auth check.');
    }
    const supabaseAuthClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    console.log('AuthUtil: supabaseAuthClient created. Attempting supabaseAuthClient.auth.getUser(accessToken). Token (first 10 chars):', accessToken.substring(0,10));

    const { data: authData, error: authError } = await supabaseAuthClient.auth.getUser(accessToken);
    
    userResult = authData?.user || null;
    errorResult = authError || null;
    console.log('AuthUtil: supabaseAuthClient.auth.getUser(accessToken) completed.', 'User found:', !!userResult, 'Error:', errorResult ? JSON.stringify(errorResult) : 'No error object');
  } catch (e) {
    console.error('AuthUtil: Exception during user retrieval from token:', e.message, e.stack);
    return { user: null, error: { message: 'Exception during token user retrieval: ' + e.message } };
  }
  
  if (errorResult) {
    console.warn('AuthUtil: Error object returned from supabaseAuthClient.auth.getUser(accessToken):', JSON.stringify(errorResult));
  }
  if (!userResult) {
    console.warn('AuthUtil: No user object found for the provided token (from supabaseAuthClient.auth.getUser(accessToken)).');
  }
  console.log('AuthUtil: getUserFromToken returning.');
  return { user: userResult, error: errorResult };
};

export { getSupabaseClient, getUserFromToken };