import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Session, User, AuthError, SignUpWithPasswordCredentials, SignInWithPasswordCredentials, Subscription, OAuthResponse } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch(err => {
      console.error("Error getting session:", err);
      setError(err as AuthError);
      setIsLoading(false);
    });

    const { data: authListenerData } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setError(null); // Clear previous errors on auth state change
        setIsLoading(false);
      }
    );

    return () => {
      authListenerData?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) setError(error);
    setIsLoading(false);
    return { error };
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp(credentials);
    if (error) setError(error);
    setIsLoading(false);
    return { error, session: data.session, user: data.user };
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setError(error);
    setIsLoading(false);
    return { error };
  };

  const signInWithGoogle = async (): Promise<OAuthResponse> => {
    setIsLoading(true);
    setError(null);
    // Menghapus opsi redirectTo agar Supabase menggunakan Site URL dari dashboard
    // atau default redirect ke halaman saat ini.
    const response = await supabase.auth.signInWithOAuth({
      provider: 'google',
      // options: {
      //   redirectTo: 'http://localhost:5173/dashboard' // Biarkan Supabase yang menangani ini berdasarkan Site URL
      // }
    });
    if (response.error) {
      setError(response.error);
    }
    // isLoading akan dihandle oleh onAuthStateChange
    return response;
  };

  const value = {
    session,
    user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};