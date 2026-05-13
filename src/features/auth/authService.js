import { supabase } from "../../lib/supabase/client.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function getCurrentSession() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();

  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  const client = requireSupabase();
  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => data.subscription.unsubscribe();
}

export async function signUpWithEmail({ email, password }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({ email, password });

  if (error) throw error;
  return data;
}

export async function signInWithEmail({ email, password }) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();

  if (error) throw error;
}

export async function signOutEverywhere() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut({ scope: "global" });

  if (error) throw error;
}
