import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Create Supabase client — returns a functional client even if env vars are empty.
// Service functions should handle errors gracefully when Supabase is not configured.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

/**
 * Helper to check if Supabase is configured.
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  return supabase !== null;
}

// ── Auth helpers ──────────────────────────────────────────────────────────

export async function signUp({ email, password, name }) {
  if (!supabase) throw new Error("Supabase is not configured");
  let result;
  try {
    result = await Promise.race([
      supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      }),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error("Sign up timed out. Please try again in a moment."),
            ),
          15000,
        ),
      ),
    ]);
  } catch (err) {
    // Check if it's a network/rate-limit error
    if (err.status === 429 || err.message?.includes("429")) {
      throw new Error("Too many attempts. Please wait a minute and try again.");
    }
    throw err;
  }
  const { data, error } = result;
  if (error) {
    if (error.status === 429) {
      throw new Error("Too many attempts. Please wait a minute and try again.");
    }
    throw error;
  }

  // If email confirmation is disabled, Supabase returns a session immediately.
  // If enabled, data.session will be null — try signing in anyway.
  if (!data.session) {
    try {
      const signInResult = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInResult.data?.session) {
        return signInResult.data;
      }
    } catch {
      // Sign-in failed (email confirmation required) — fall through
    }
    throw new Error(
      "Account created! Please check your email to confirm, then sign in.",
    );
  }

  return data;
}

export async function signIn({ email, password }) {
  if (!supabase) throw new Error("Supabase is not configured");
  let result;
  try {
    result = await Promise.race([
      supabase.auth.signInWithPassword({ email, password }),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error("Sign in timed out. Please try again in a moment."),
            ),
          15000,
        ),
      ),
    ]);
  } catch (err) {
    if (err.status === 429 || err.message?.includes("429")) {
      throw new Error("Too many attempts. Please wait a minute and try again.");
    }
    throw err;
  }
  const { data, error } = result;
  if (error) {
    if (error.status === 429) {
      throw new Error("Too many attempts. Please wait a minute and try again.");
    }
    // Handle unconfirmed email
    if (error.message?.includes("Email not confirmed")) {
      throw new Error(
        "Please confirm your email address first. Check your inbox for the confirmation link.",
      );
    }
    throw error;
  }
  return data;
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/" },
  });
  if (error) throw error;
  return data;
}

export async function signInWithGithub() {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: window.location.origin + "/" },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
}
