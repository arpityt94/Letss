import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url === 'MY_SUPABASE_URL' || anonKey === 'MY_SUPABASE_ANON_KEY') {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return supabaseClient;
}

/**
 * Register a user via Supabase Auth
 */
export async function supabaseSignUp(email: string, pass: string, name: string) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase integration is not fully configured yet. Please configure SUPABASE_URL and SUPABASE_ANON_KEY.');
  }

  const { data, error } = await client.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: name
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Sign in a user via Supabase Auth
 */
export async function supabaseSignIn(email: string, pass: string) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase integration is not fully configured yet. Please configure SUPABASE_URL and SUPABASE_ANON_KEY.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: pass
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Retrieve user via Supabase Auth token verification
 */
export async function supabaseGetUser(token: string) {
  const client = getSupabase();
  if (!client) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await client.auth.getUser(token);
  if (error) {
    throw error;
  }

  return data.user;
}
