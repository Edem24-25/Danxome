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
  estVerifie: boolean;
  estEnAttente: boolean;
  estSuspendu: boolean;
  estPro: boolean;
  peutPublier: boolean;
  signUp: (params: {
    email: string;
    password: string;
    prenom: string;
    nom: string;
    profil: ProfilType;
    telephone?: string;
    ville?: string;
    categorie?: string;
    description?: string;
    portfolio_url?: string;
    nom_artiste?: string;
    annees_experience?: number;
    social_links?: Record<string, string>;
    website_url?: string;
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
  const initializedRef = useRef(false);

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
            console.warn("Erreur chargement profil:", error.message);
            setProfile(null);
          } else {
            setProfile(data as Profile | null);
          }
        }
      } catch {
        if (!controller.signal.aborted) {
          console.warn("Erreur réseau lors du chargement du profil");
          setProfile(null);
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
      initializedRef.current = true;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!initializedRef.current) return;
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
    const handleVisibility = async () => {
      if (document.visibilityState === "visible") {
        const {
          data: { session: s },
        } = await supabase.auth.getSession();
        if (s) {
          setSession(s);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [supabase]);

  const signUp = useCallback(
    async ({
      email,
      password,
      prenom,
      nom,
      profil,
      telephone,
      ville,
      categorie,
      description,
      portfolio_url,
      nom_artiste,
      annees_experience,
      social_links,
      website_url,
    }: {
      email: string;
      password: string;
      prenom: string;
      nom: string;
      profil: ProfilType;
      telephone?: string;
      ville?: string;
      categorie?: string;
      description?: string;
      portfolio_url?: string;
      nom_artiste?: string;
      annees_experience?: number;
      social_links?: Record<string, string>;
      website_url?: string;
    }) => {
      const metadata: Record<string, string> = { prenom, nom, profil };
      if (telephone) metadata["telephone"] = telephone;
      if (ville) metadata["ville"] = ville;
      if (categorie) metadata["categorie"] = categorie;
      if (description) metadata["description"] = description;
      if (portfolio_url) metadata["portfolio_url"] = portfolio_url;
      if (nom_artiste) metadata["nom_artiste"] = nom_artiste;
      if (annees_experience) metadata["annees_experience"] = String(annees_experience);
      if (social_links) metadata["social_links"] = JSON.stringify(social_links);
      if (website_url) metadata["website_url"] = website_url;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
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
    window.location.href = "/";
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
      // Mise à jour optimiste : applique les changements localement sans re-fetch
      setProfile((prev) => (prev ? { ...prev, ...params } : prev));
      return {};
    },
    [supabase, session?.user],
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

  const estPro = profile?.profil === "artiste" || profile?.profil === "artisan";
  const estVerifie = estPro && profile?.statut === "valide";
  const estEnAttente = estPro && profile?.statut === "en_attente";
  const estSuspendu = estPro && profile?.statut === "suspendu";
  const peutPublier = estVerifie;

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        peutCommander: loading ? false : !session?.user || profile?.profil === "visiteur",
        estVerifie,
        estEnAttente,
        estSuspendu,
        estPro,
        peutPublier,
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
