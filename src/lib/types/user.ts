export type ProfilType = "visiteur" | "artiste" | "artisan" | "admin";
export type ProfilStatut = "en_attente" | "valide" | "rejete" | "suspendu";

export type DocumentType =
  | "carte_professionnelle"
  | "justificatif_activite"
  | "registre_metiers"
  | "photo_atelier"
  | "photo_creation"
  | "autre";

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
  statut: ProfilStatut;
  avatar_url: string | null;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
  pays: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_url: string;
  file_name: string | null;
  uploaded_at: string;
}

/** Vérifie si le profil a accès aux fonctionnalités professionnelles */
export function estVerifie(statut: ProfilStatut | undefined): boolean {
  return statut === "valide";
}

/** Vérifie si le profil est en attente de vérification */
export function estEnAttente(statut: ProfilStatut | undefined): boolean {
  return statut === "en_attente";
}

/** Vérifie si le profil est suspendu */
export function estSuspendu(statut: ProfilStatut | undefined): boolean {
  return statut === "suspendu";
}

/** Vérifie si le profil a accès aux fonctionnalités pro (pas en attente ni suspendu) */
export function peutAccederAuxFonctionnalitesPro(
  profil: ProfilType | undefined,
  statut: ProfilStatut | undefined,
): boolean {
  if (profil !== "artiste" && profil !== "artisan") return true;
  return statut === "valide";
}
