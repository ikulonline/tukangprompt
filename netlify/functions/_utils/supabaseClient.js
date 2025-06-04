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
  
  let userResult = null;
  let errorResult = null;

  try { // Outer try block
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('AuthUtil: SUPABASE_URL or SUPABASE_ANON_KEY missing for direct client creation in getUserFromToken.');
      throw new Error('Server configuration error: Supabase credentials missing for auth check.');
    }
    const supabaseAuthClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    console.log('AuthUtil: supabaseAuthClient created for getUser.');
    console.log('AuthUtil: Token type:', typeof accessToken, 'Token length:', accessToken.length, 'Token (first 10 chars):', accessToken.substring(0,10));
    
    let authDataFromGetUser, authErrorFromGetUser;

    try { // Inner, specific try-catch for the critical await call
        console.log('AuthUtil: >>> TRYING (inner try): await supabaseAuthClient.auth.getUser(accessToken)');
        const resultFromGetUser = await supabaseAuthClient.auth.getUser(accessToken);
        authDataFromGetUser = resultFromGetUser.data;
        authErrorFromGetUser = resultFromGetUser.error;
        console.log('AuthUtil: <<< SUCCESS (inner try): await supabaseAuthClient.auth.getUser(accessToken) completed.');
    } catch (specificAuthError) {
        console.error('AuthUtil: XXX CATCH (inner try): Error DIRECTLY from await supabaseAuthClient.auth.getUser(accessToken):', 
                      specificAuthError.message, 
                      specificAuthError.stack, 
                      JSON.stringify(specificAuthError));
        errorResult = { message: 'Failed during auth.getUser call: ' + specificAuthError.message, caughtErrorName: specificAuthError.name, caughtErrorStack: specificAuthError.stack };
        userResult = null; 
    }

    // Process results if the inner try did not already set a critical errorResult
    if (!errorResult) { 
        userResult = authDataFromGetUser?.user || null;
        // If specificAuthError was caught, authErrorFromGetUser might be undefined.
        // If getUser completed but returned an error, authErrorFromGetUser will have it.
        errorResult = authErrorFromGetUser || null; 
        
        console.log('AuthUtil: supabaseAuthClient.auth.getUser results processed (after inner try).', 
                    'User object found:', !!userResult, 
                    'Error object from getUser:', errorResult ? JSON.stringify(errorResult) : 'null/undefined');
    } else {
        console.log('AuthUtil: Skipping further processing of getUser results due to error caught in inner try.');
    }

  } catch (e) { // Outer catch for other unexpected errors in the setup or broader logic
    console.error('AuthUtil: Exception in OUTER try block of getUserFromToken:', e.message, e.stack);
    errorResult = { message: 'Outer exception in getUserFromToken: ' + e.message, caughtErrorName: e.name, caughtErrorStack: e.stack };
    userResult = null;
  }
  
  // Final logging and return
  if (errorResult) {
    console.warn('AuthUtil: Final check - An errorResult is being returned:', JSON.stringify(errorResult));
  }
  if (!userResult && !errorResult) {
    // This case might occur if getUser completes successfully (no exception, no error object returned from Supabase) but data.user is null.
    // This could indicate an invalid/expired token that Supabase handles by returning { data: { user: null }, error: null }.
    console.warn('AuthUtil: Final check - No user and no explicit error object. Token might be invalid/expired without throwing.');
    // It might be better to construct an errorResult here if no user is found.
    errorResult = { message: 'No user data found for token, and no explicit error from Supabase. Token may be invalid or expired.' };
  }

  console.log('AuthUtil: getUserFromToken returning. User found:', !!userResult, "Error present:", !!errorResult);
  return { user: userResult, error: errorResult };
};

export { getSupabaseClient, getUserFromToken };