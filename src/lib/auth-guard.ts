import { redirect } from "@tanstack/react-router";
import { createClient } from "@/lib/supabase/client";
import type { ProfilType } from "@/lib/types/user";

let cachedProfile: { id: string; profil: ProfilType } | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds

export async function requireAuth() {
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

  // Use cached profile if fresh
  if (cachedProfile && cachedProfile.id === user.id && now - cacheTimestamp < CACHE_TTL) {
    if (!allowedRoles.includes(cachedProfile.profil)) {
      throw redirect({ to: "/auth/login", search: { from: undefined } });
    }
    return { user, profil: cachedProfile.profil };
  }

  const supabase = createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("profil")
    .eq("id", user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.profil)) {
    throw redirect({ to: "/auth/login", search: { from: undefined } });
  }

  cachedProfile = { id: user.id, profil: profile.profil };
  cacheTimestamp = now;

  return { user, profil: profile.profil };
}
