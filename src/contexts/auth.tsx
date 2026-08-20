import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfilType } from "@/lib/types/user";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  peutCommander: boolean;
  signUp: (params: {
    email: string;
    password: string;
    prenom: string;
    nom: string;
    profil: ProfilType;
  }) => Promise<{ error?: string }>;
  signIn: (params: {
    email: string;
    password: string;
  }) => Promise<{ error?: string; profil?: ProfilType }>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (
    params: Partial<
      Pick<Profile, "prenom" | "nom" | "telephone" | "adresse" | "ville" | "pays" | "avatar_url">
    >,
  ) => Promise<{ error?: string }>;
  changePassword: (newPassword: string) => Promise<{ error?: string }>;
  deleteAccount: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const profileAbortRef = useRef<AbortController | null>(null);

  const fetchProfile = useCallback(
    async (userId: string) => {
      profileAbortRef.current?.abort();
      const controller = new AbortController();
      profileAbortRef.current = controller;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "id, email, prenom, nom, profil, statut, avatar_url, telephone, adresse, ville, pays, created_at, updated_at",
          )
          .eq("id", userId)
          .single();
        if (!controller.signal.aborted) {
          if (error) {
            setProfile(null);
            setSession(null);
            await supabase.auth.signOut();
          } else {
            setProfile(data as Profile | null);
          }
        }
      } catch {
        if (!controller.signal.aborted) {
          setProfile(null);
          setSession(null);
          await supabase.auth.signOut();
        }
      }
    },
    [supabase],
  );

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  }, [session?.user, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (s) {
        setSession(s);
        await supabase.auth.refreshSession();
      }
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [supabase]);

  const signUp = useCallback(
    async ({
      email,
      password,
      prenom,
      nom,
      profil,
    }: {
      email: string;
      password: string;
      prenom: string;
      nom: string;
      profil: ProfilType;
    }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { prenom, nom, profil },
        },
      });
      if (error) return { error: "Erreur lors de l'inscription. Réessayez." };
      return {};
    },
    [supabase],
  );

  const signIn = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      const { data: prof } = await supabase
        .from("profiles")
        .select("profil")
        .eq("id", data.user.id)
        .single();
      const profil = (prof?.profil as ProfilType) ?? "visiteur";
      return { profil };
    },
    [supabase],
  );

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, [supabase]);

  const signInWithApple = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    setSession(null);
    setProfile(null);
    await supabase.auth.signOut();
  }, [supabase]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) return { error: error.message };
      return {};
    },
    [supabase],
  );

  const updateProfile = useCallback(
    async (
      params: Partial<
        Pick<Profile, "prenom" | "nom" | "telephone" | "adresse" | "ville" | "pays" | "avatar_url">
      >,
    ) => {
      if (!session?.user) return { error: "Non connecté" };
      const { error } = await supabase.from("profiles").update(params).eq("id", session.user.id);
      if (error) return { error: error.message };
      await fetchProfile(session.user.id);
      return {};
    },
    [supabase, session?.user, fetchProfile],
  );

  const changePassword = useCallback(
    async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: error.message };
      await supabase.auth.signOut({ scope: "global" });
      setSession(null);
      setProfile(null);
      return {};
    },
    [supabase],
  );

  const deleteAccount = useCallback(async () => {
    if (!session?.user) return { error: "Non connecté" };
    const { error } = await supabase.rpc("delete_user");
    if (error) return { error: error.message };
    setSession(null);
    setProfile(null);
    return {};
  }, [supabase, session?.user]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        peutCommander: loading ? false : !session?.user || profile?.profil === "visiteur",
        signUp,
        signIn,
        signInWithGoogle,
        signInWithApple,
        signOut,
        resetPassword,
        refreshProfile,
        updateProfile,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
