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

  try { // Outer try block for setup or other logic
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('AuthUtil: SUPABASE_URL or SUPABASE_ANON_KEY missing for direct client creation in getUserFromToken.');
      throw new Error('Server configuration error: Supabase credentials missing for auth check.');
    }
    const supabaseAuthClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    console.log('AuthUtil: supabaseAuthClient created for getUser.');
    console.log('AuthUtil: Token type:', typeof accessToken, 'Token length:', accessToken.length, 'Token (first 10 chars):', accessToken.substring(0,10));
    
    let rawAuthData = null;
    let rawAuthError = null;

    console.log('AuthUtil: >>> Entering critical section: await supabaseAuthClient.auth.getUser(accessToken)');
    try {
        const { data, error } = await supabaseAuthClient.auth.getUser(accessToken);
        // This log is critical: if it appears, the await completed.
        console.log('AuthUtil: <<< Critical section completed: await supabaseAuthClient.auth.getUser(accessToken)'); 
        
        rawAuthData = data;
        rawAuthError = error;

        console.log('AuthUtil: Raw data from supabase.auth.getUser:', JSON.stringify(rawAuthData, null, 2));
        console.log('AuthUtil: Raw error from supabase.auth.getUser:', rawAuthError ? JSON.stringify(rawAuthError, Object.getOwnPropertyNames(rawAuthError)) : 'null');

        if (rawAuthError) {
            console.warn('AuthUtil: Error object returned by supabase.auth.getUser processing.');
            errorResult = { 
                message: 'Error from supabase.auth.getUser: ' + (rawAuthError.message || 'Unknown auth error'), 
                details: rawAuthError 
            };
        }
        
        userResult = rawAuthData?.user || null;

        if (userResult) {
            console.log('AuthUtil: User successfully retrieved from token:', userResult.id);
        } else if (!rawAuthError) {
            // No user and no explicit error from Supabase means the token might be invalid/expired.
            console.warn('AuthUtil: No user data found for token, and no explicit error from Supabase. Token may be invalid or expired.');
            errorResult = { message: 'No user data found for token (potentially invalid/expired).' };
        }

    } catch (e) {
        // This catch block is for exceptions THROWN by the await call itself,
        // if it's not a Supabase-structured error (e.g. promise rejects with non-standard error).
        console.error('AuthUtil: XXX Exception DIRECTLY from await supabaseAuthClient.auth.getUser(accessToken):');
        console.error('AuthUtil: Error Type:', typeof e);
        console.error('AuthUtil: Is instanceof Error:', e instanceof Error);
        console.error('AuthUtil: Error Message:', e?.message);
        console.error('AuthUtil: Error Stack:', e?.stack);
        // Attempt to stringify the error, including non-enumerable properties.
        try {
            console.error('AuthUtil: Error (Full JSON with own props):', JSON.stringify(e, Object.getOwnPropertyNames(e)));
        } catch (stringifyError) {
            console.error('AuthUtil: Could not stringify the caught error object:', stringifyError.message);
            console.error('AuthUtil: Error (toString()):', String(e));
        }
        
        errorResult = { 
            message: 'Exception during auth.getUser: ' + (e?.message || 'Undescribed exception'), 
            errorName: e?.name, 
            rawErrorString: String(e) // Fallback to string conversion
        };
        userResult = null;
    }

  } catch (outerException) { 
    // This catch is for errors during setup (e.g., client creation) or other logic outside the critical await block.
    console.error('AuthUtil: Exception in OUTER try block of getUserFromToken:', outerException?.message, outerException?.stack);
    errorResult = { 
        message: 'Outer exception in getUserFromToken: ' + (outerException?.message || 'Undescribed outer exception'), 
        errorName: outerException?.name 
    };
    userResult = null;
  }
  
  console.log('AuthUtil: getUserFromToken returning. User found:', !!userResult, "Error present:", !!errorResult);
  if(errorResult) {
    try {
        console.log('AuthUtil: Final errorResult being returned:', JSON.stringify(errorResult, Object.getOwnPropertyNames(errorResult)));
    } catch (finalStringifyError) {
        console.log('AuthUtil: Could not stringify final errorResult. Message:', errorResult.message);
    }
  }
  
  return { user: userResult, error: errorResult };
};

export { getSupabaseClient, getUserFromToken };
