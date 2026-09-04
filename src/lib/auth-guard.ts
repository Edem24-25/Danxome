import { redirect } from "@tanstack/react-router";
import { createClient } from "@/lib/supabase/client";
import type { ProfilType } from "@/lib/types/user";
import type { User } from "@supabase/supabase-js";

let cachedProfile: { id: string; profil: ProfilType } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds

export async function requireAuth(): Promise<User> {
  if (typeof window === "undefined") {
    return { id: "", email: "" } as User;
  }
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw redirect({ to: "/auth/login", search: { from: undefined } });
  }

  return session.user;
}

export async function requireRole(allowedRoles: ProfilType[]) {
  const user = await requireAuth();
  const now = Date.now();

  if (typeof window === "undefined") {
    return { user, profil: allowedRoles[0] };
  }

  // Use cached profile if fresh
  if (cachedProfile && cachedProfile.id === user.id && now - cacheTimestamp < CACHE_TTL) {
    if (!allowedRoles.includes(cachedProfile.profil)) {
      throw redirect({ to: "/" as const });
    }
    return { user, profil: cachedProfile.profil };
  }

  const supabase = createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("profil")
    .eq("id", user.id)
    .single();

  // En cas d'erreur DB (RLS, etc.), on autorise l'accès plutôt que de déconnecter
  if (error) {
    console.warn("auth-guard: erreur récupération profil, accès autorisé:", error.message);
    cachedProfile = { id: user.id, profil: "visiteur" };
    cacheTimestamp = now;
    return { user, profil: "visiteur" as ProfilType };
  }

  if (!profile || !allowedRoles.includes(profile.profil)) {
    throw redirect({ to: "/" as const });
  }

  cachedProfile = { id: user.id, profil: profile.profil };
  cacheTimestamp = now;

  return { user, profil: profile.profil };
}
