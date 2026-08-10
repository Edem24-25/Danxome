export type ProfilType = "visiteur" | "artiste" | "artisan" | "admin";

export function accueilProfil(
  profil: ProfilType | null | undefined,
): "/artiste" | "/admin" | "/profil" {
  if (profil === "admin") return "/admin";
  if (profil === "artiste" || profil === "artisan") return "/artiste";
  return "/profil";
}

export interface Profile {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  profil: ProfilType;
  avatar_url: string | null;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
  pays: string | null;
  created_at: string;
  updated_at: string;
}
