import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError, SignUpWithPasswordCredentials, SignInWithPasswordCredentials, Subscription, OAuthResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types'; // Import UserProfile

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null; // Add profile
  isLoading: boolean;
  profileLoading: boolean; // Add profileLoading
  error: AuthError | null;
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<{ error: AuthError | null }>;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<{ error: AuthError | null, session: Session | null, user: User | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<OAuthResponse>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null); // Add profile state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(true); // Add profileLoading state
  const [error, setError] = useState<AuthError | null>(null);

  const fetchUserProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setProfile(null);
      } else {
        setProfile(data as UserProfile);
      }
    } catch (e) {
      console.error('Unexpected error fetching profile:', e);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setProfileLoading(true); // Start profile loading as well

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
      setIsLoading(false);
    }).catch(err => {
      console.error("Error getting session:", err);
      setError(err as AuthError);
      setProfile(null);
      setIsLoading(false);
      setProfileLoading(false);
    });

    const { data: authListenerData } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        const newUser = newSession?.user ?? null;
        setUser(newUser);
        setError(null); 
        if (newUser) {
          await fetchUserProfile(newUser.id);
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
        setIsLoading(false); // Auth loading done
      }
    );

    return () => {
      authListenerData?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    setIsLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
    if (signInError) setError(signInError);
    // User and profile will be updated by onAuthStateChange
    setIsLoading(false);
    return { error: signInError };
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials) => {
    setIsLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp(credentials);
    if (signUpError) setError(signUpError);
    // User and profile will be updated by onAuthStateChange if signup is successful and trigger runs
    setIsLoading(false);
    return { error: signUpError, session: data.session, user: data.user };
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError);
    // User and profile will be set to null by onAuthStateChange
    setProfile(null); 
    setIsLoading(false);
    return { error: signOutError };
  };

  const signInWithGoogle = async (): Promise<OAuthResponse> => {
    setIsLoading(true);
    setError(null);
    const response = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (response.error) {
      setError(response.error);
    }
    // isLoading, user, and profile will be handled by onAuthStateChange
    return response;
  };

  const value = {
    session,
    user,
    profile, // Provide profile
    isLoading,
    profileLoading, // Provide profileLoading
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
