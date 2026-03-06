import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  supabase,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  signInWithGoogle as authGoogle,
  signInWithGithub as authGithub,
  onAuthStateChange,
} from "../services/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from profiles table
  async function fetchProfile(userId) {
    if (!supabase) return null;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return data;
    } catch {
      return null;
    }
  }

  // Detect OAuth errors from redirect URL hash (e.g. #error=...&error_description=...)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace(/^#/, ""));
      const errorDesc = params.get("error_description") || params.get("error");
      if (errorDesc) {
        const msg = decodeURIComponent(errorDesc).replace(/\+/g, " ");
        toast.error(msg || "OAuth sign-in failed.");
        // Clean the URL so the error doesn't persist on refresh
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Safety timeout — if Supabase never responds, stop loading after 3s
    const timeout = setTimeout(() => {
      console.warn("[Auth] Timed out waiting for Supabase session");
      setLoading(false);
    }, 3000);

    // Use onAuthStateChange with INITIAL_SESSION to avoid separate getSession() call
    // This prevents the lock race condition caused by React StrictMode double-mount
    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setUser(session.user);
          // Mark loading done BEFORE the async profile fetch so the UI unblocks
          clearTimeout(timeout);
          setLoading(false);
          // Profile fetch is non-blocking
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        } else {
          setUser(null);
          setProfile(null);
          clearTimeout(timeout);
          setLoading(false);
        }
      } catch (err) {
        console.error("[Auth] Error in auth state change:", err);
        clearTimeout(timeout);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // ── Auth methods ─────────────────────────────────────────────────────────

  async function signIn({ email, password }) {
    const data = await authSignIn({ email, password });
    return data;
  }

  async function signUp({ email, password, name }) {
    const data = await authSignUp({ email, password, name });
    return data;
  }

  async function signInWithGoogle() {
    return authGoogle();
  }

  async function signInWithGithub() {
    return authGithub();
  }

  async function signOut() {
    await authSignOut();
    setUser(null);
    setProfile(null);
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    profile?.avatar_url || user?.user_metadata?.avatar_url || null;

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const value = {
    user,
    profile,
    loading,
    displayName,
    avatarUrl,
    initials,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Safe default so the app doesn't crash if the provider hasn't mounted yet
// (e.g. during Vite HMR or error boundary recovery).
const AUTH_DEFAULTS = {
  user: null,
  profile: null,
  loading: true,
  displayName: "User",
  avatarUrl: null,
  initials: "U",
  isAuthenticated: false,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  signOut: async () => {},
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx ?? AUTH_DEFAULTS;
}
