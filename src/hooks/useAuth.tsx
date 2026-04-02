import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "reader" | "journalist" | "admin";
type ActiveMode = "reader" | "journalist";

interface JournalistProfile {
  bio: string | null;
  specialization: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  // Legacy: primary role (first role found)
  role: AppRole | null;
  // All roles the user has
  roles: AppRole[];
  // Current active UI mode
  activeMode: ActiveMode;
  switchMode: (mode: ActiveMode) => void;
  // Whether journalist profile is complete enough to publish
  journalistProfileComplete: boolean;
  journalistProfile: JournalistProfile | null;
  refreshRoles: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: AppRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_MODE_KEY = "midia_active_mode";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [activeMode, setActiveMode] = useState<ActiveMode>(() => {
    return (localStorage.getItem(ACTIVE_MODE_KEY) as ActiveMode) ?? "reader";
  });
  const [journalistProfile, setJournalistProfile] = useState<JournalistProfile | null>(null);

  // Derived: primary role
  const role: AppRole | null = roles.length > 0 ? roles[0] : null;

  // Journalist profile is "complete" if bio has at least 20 chars and specialization is set
  const journalistProfileComplete =
    !!journalistProfile?.bio &&
    journalistProfile.bio.trim().length >= 20 &&
    !!journalistProfile?.specialization;

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const fetchedRoles = (data?.map((r) => r.role) ?? []) as AppRole[];
    setRoles(fetchedRoles);

    // If user has journalist role, fetch their profile
    if (fetchedRoles.includes("journalist")) {
      const { data: profile } = await supabase
        .from("journalist_profiles")
        .select("bio, specialization")
        .eq("user_id", userId)
        .maybeSingle();
      setJournalistProfile(profile ?? null);
    }

    // Sync activeMode: if stored mode requires journalist role but user doesn't have it, reset
    const storedMode = localStorage.getItem(ACTIVE_MODE_KEY) as ActiveMode;
    if (storedMode === "journalist" && !fetchedRoles.includes("journalist")) {
      setActiveMode("reader");
      localStorage.setItem(ACTIVE_MODE_KEY, "reader");
    }
  };

  const refreshRoles = async () => {
    if (user) await fetchRoles(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchRoles(session.user.id), 0);
      } else {
        setRoles([]);
        setJournalistProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const switchMode = (mode: ActiveMode) => {
    if (mode === "journalist" && !roles.includes("journalist")) return;
    setActiveMode(mode);
    localStorage.setItem(ACTIVE_MODE_KEY, mode);
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    _selectedRole: AppRole
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(ACTIVE_MODE_KEY);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        roles,
        activeMode,
        switchMode,
        journalistProfileComplete,
        journalistProfile,
        refreshRoles,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
