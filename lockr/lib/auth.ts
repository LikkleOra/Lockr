'use client';

import { supabase } from './supabase';

export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
  return supabase.auth.signUp({ email, password });
};

export const getSession = async () => {
  return supabase.auth.getSession();
};
