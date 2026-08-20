import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Profile, ProfilType } from "@/lib/types/user";

const supabase = createClient();

// ============================================================
// Types
// ============================================================

export type Site = {
  id: string;
  slug: string;
  nom: string;
  region: string;
  type: string;
  note: number;
  avis_count: number;
  prix: number;
  image_url: string;
  resume: string;
  coords_x: number;
  coords_y: number;
  virtuel: boolean;
};

export type Musee = {
  id: string;
  slug: string;
  nom: string;
  ville: string;
  image_url: string;
  resume: string;
  horaires: string[];
};

export type FriseItem = { annee: string; texte: string };
export type VisiterLink = { titre: string; slug: string; type: "site" | "visite" | "musee" };

export type Royaume = {
  id: string;
  slug: string;
  nom: string;
  periode: string;
  image_url: string;
  resume: string;
  conte: string[];
  frise: FriseItem[];
  visiter: VisiterLink[];
};

export type Langue = {
  id: string;
  nom: string;
  locuteurs: string;
  region: string;
  salut: string;
  sens: string;
};

export type Artiste = {
  id: string;
  slug: string;
  nom: string;
  metier: string;
  ville: string;
  image_url: string;
  bio: string;
  user_id: string | null;
};

export type Oeuvre = {
  id: string;
  slug: string;
  titre: string;
  artiste_id: string;
  categorie: string;
  region: string;
  prix: number;
  image_url: string;
  description: string;
  statut: "publiee" | "brouillon";
  // Joined fields
  artiste?: Artiste;
};

export type Evenement = {
  id: string;
  slug: string;
  titre: string;
  date: string;
  jour: number;
  mois: string;
  lieu: string;
  categorie: string;
  image_url: string;
  resume: string;
};

export type Plat = {
  id: string;
  slug: string;
  nom: string;
  region: string;
  categorie: string;
  image_url: string;
  resume: string;
  ingredients: string[];
  preparation: string;
  origine: string;
  ou: string;
  histoire: string;
  curiosite: string;
};

export type DossierSection = {
  titre: string;
  contenu: string;
  image_url?: string;
};

export type Dossier = {
  id: string;
  slug: string;
  titre: string;
  sous_titre: string | null;
  image_url: string | null;
  resume: string | null;
  categorie: string;
  auteur: string | null;
  date_publication: string;
  sections: DossierSection[];
};

// ============================================================
// Helpers
// ============================================================

export const formatFcfa = (n: number) =>
  `${n.toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA`;

export const PAGE_SIZE = 20;

// ============================================================
// Sites
// ============================================================

export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .order("nom");
      if (error) throw error;
      return data as Site[];
    },
  });
}

export function useSitesPaginated(page = 1) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  return useQuery({
    queryKey: ["sites", "paginated", page],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("sites")
        .select("*", { count: "exact" })
        .order("nom")
        .range(from, to);
      if (error) throw error;
      return { data: data as Site[], total: count ?? 0, totalPages: Math.ceil((count ?? 0) / PAGE_SIZE) };
    },
  });
}

export function useSite(slug: string) {
  return useQuery({
    queryKey: ["sites", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Site;
    },
    enabled: !!slug,
  });
}

// ============================================================
// Musées
// ============================================================

export function useMusees() {
  return useQuery({
    queryKey: ["musees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("musees")
        .select("*")
        .order("nom");
      if (error) throw error;
      return data as Musee[];
    },
  });
}

export function useMusee(slug: string) {
  return useQuery({
    queryKey: ["musees", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("musees")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Musee;
    },
    enabled: !!slug,
  });
}

// ============================================================
// Royaumes
// ============================================================

export function useRoyaumes() {
  return useQuery({
    queryKey: ["royaumes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("royaumes")
        .select("*")
        .order("nom");
      if (error) throw error;
      return data as Royaume[];
    },
  });
}

export function useRoyaume(slug: string) {
  return useQuery({
    queryKey: ["royaumes", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("royaumes")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Royaume;
    },
    enabled: !!slug,
  });
}

// ============================================================
// Langues
// ============================================================

export function useLangues() {
  return useQuery({
    queryKey: ["langues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("langues")
        .select("*")
        .order("nom");
      if (error) throw error;
      return data as Langue[];
    },
  });
}

// ============================================================
// Artistes
// ============================================================

export function useArtistes() {
  return useQuery({
    queryKey: ["artistes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artistes")
        .select("*")
        .order("nom");
      if (error) throw error;
      return data as Artiste[];
    },
  });
}

export function useArtistesPaginated(page = 1) {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  return useQuery({
    queryKey: ["artistes", "paginated", page],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("artistes")
        .select("*", { count: "exact" })
        .order("nom")
        .range(from, to);
      if (error) throw error;
      return { data: data as Artiste[], total: count ?? 0, totalPages: Math.ceil((count ?? 0) / PAGE_SIZE) };
    },
  });
}

export function useArtiste(slug: string) {
  return useQuery({
    queryKey: ["artistes", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artistes")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Artiste;
    },
    enabled: !!slug,
  });
}

// ============================================================
// Œuvres
// ============================================================

export function useOeuvres(options?: { categorie?: string; artisteId?: string }) {
  return useQuery({
    queryKey: ["oeuvres", options],
    queryFn: async () => {
      let query = supabase
        .from("oeuvres")
        .select("*, artiste:artistes(*)")
        .eq("statut", "publiee")
        .order("created_at", { ascending: false });

      if (options?.categorie) {
        query = query.eq("categorie", options.categorie);
      }
      if (options?.artisteId) {
        query = query.eq("artiste_id", options.artisteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Oeuvre[];
    },
  });
}

export function useOeuvre(slug: string) {
  return useQuery({
    queryKey: ["oeuvres", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oeuvres")
        .select("*, artiste:artistes(*)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Oeuvre;
    },
    enabled: !!slug,
  });
}

export function useMesOeuvres() {
  return useQuery({
    queryKey: ["oeuvres", "mes"],
    queryFn: async () => {
      const { data: artiste, error: artisteErr } = await supabase
        .from("artistes")
        .select("id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
        .single();

      if (artisteErr || !artiste) return [];

      const { data, error } = await supabase
        .from("oeuvres")
        .select("*, artiste:artistes(*)")
        .eq("artiste_id", artiste.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Oeuvre[];
    },
  });
}

export function useAddOeuvre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (oeuvre: Omit<Oeuvre, "id" | "artiste"> & { artiste_id: string }) => {
      const { data, error } = await supabase
        .from("oeuvres")
        .insert(oeuvre)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oeuvres"] });
    },
  });
}

export function useUpdateOeuvreStatut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: "publiee" | "brouillon" }) => {
      const { error } = await supabase
        .from("oeuvres")
        .update({ statut })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oeuvres"] });
    },
  });
}

export function useDeleteOeuvre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("oeuvres")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oeuvres"] });
    },
  });
}

// ============================================================
// Événements
// ============================================================

export function useEvenements() {
  return useQuery({
    queryKey: ["evenements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evenements")
        .select("*")
        .order("jour");
      if (error) throw error;
      return data as Evenement[];
    },
  });
}

export function useEvenement(slug: string) {
  return useQuery({
    queryKey: ["evenements", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evenements")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Evenement;
    },
    enabled: !!slug,
  });
}

// ============================================================
// Plats
// ============================================================

export function usePlats(options?: { categorie?: string; region?: string }) {
  return useQuery({
    queryKey: ["plats", options],
    queryFn: async () => {
      let query = supabase
        .from("plats")
        .select("*")
        .order("nom");

      if (options?.categorie) {
        query = query.eq("categorie", options.categorie);
      }
      if (options?.region) {
        query = query.eq("region", options.region);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Plat[];
    },
  });
}

export function usePlat(slug: string) {
  return useQuery({
    queryKey: ["plats", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plats")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Plat;
    },
    enabled: !!slug,
  });
}

// ============================================================
// Commandes
// ============================================================

export type CommandeStatut = "recue" | "validee" | "en_cours" | "expediee" | "livree" | "annulee";

export const statutsCommandes = [
  { id: "recue" as const, label: "Reçue" },
  { id: "validee" as const, label: "Validée" },
  { id: "en_cours" as const, label: "En cours" },
  { id: "expediee" as const, label: "Expédiée" },
  { id: "livree" as const, label: "Livrée" },
];

export type Commande = {
  id: string;
  ref: string;
  client_id: string;
  client_nom: string;
  oeuvre_id: string;
  oeuvre_titre: string;
  artiste_nom: string;
  montant: number;
  date: string;
  statut: CommandeStatut;
};

export function statutLabel(id: CommandeStatut): string {
  return statutsCommandes.find((s) => s.id === id)?.label ?? id;
}

/** Commandes liées au profil artiste (via artiste.user_id = auth.uid()). */
export function useCommandes() {
  return useQuery({
    queryKey: ["commandes"],
    queryFn: async () => {
      const { data: artiste, error: artisteErr } = await supabase
        .from("artistes")
        .select("nom")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
        .single();

      if (artisteErr || !artiste) return [];

      const { data, error } = await supabase
        .from("commandes")
        .select("*")
        .eq("artiste_nom", artiste.nom)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Commande[];
    },
  });
}

export function useCommandesClient() {
  return useQuery({
    queryKey: ["commandes", "client"],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return [] as Commande[];
      const { data, error } = await supabase
        .from("commandes")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Commande[];
    },
  });
}

export function useCreateCommande() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commande: Omit<Commande, "id" | "ref">) => {
      const { createOrderFromCart } = await import("@/server-functions/commands");
      const result = await createOrderFromCart({
        data: {
          client_id: commande.client_id,
          client_nom: commande.client_nom,
          items: [{ oeuvre_id: commande.oeuvre_id, qte: 1 }],
        },
      });
      return result.commandes[0] as Commande;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes"] });
      queryClient.invalidateQueries({ queryKey: ["panier"] });
    },
  });
}

export function useUpdateCommandeStatut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ref, statut }: { ref: string; statut: CommandeStatut }) => {
      const { error } = await supabase
        .from("commandes")
        .update({ statut })
        .eq("ref", ref);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes"] });
    },
  });
}

// ============================================================
// Panier (Supabase)
// ============================================================

export type PanierItem = {
  id: string;
  oeuvre_id: string;
  qte: number;
  // Joined
  oeuvre?: Oeuvre;
};

export function usePanier() {
  return useQuery({
    queryKey: ["panier"],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id ?? "";
      if (!userId) return [];
      const { data, error } = await supabase
        .from("panier_items")
        .select("*, oeuvre:oeuvres(*, artiste:artistes(*))")
        .eq("user_id", userId);
      if (error) throw error;
      return data as PanierItem[];
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ oeuvreId, qte = 1 }: { oeuvreId: string; qte?: number }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { error } = await supabase
        .from("panier_items")
        .upsert({ user_id: userId, oeuvre_id: oeuvreId, qte }, { onConflict: "user_id,oeuvre_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panier"] });
    },
  });
}

export function useUpdateCartQty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ oeuvreId, qte }: { oeuvreId: string; qte: number }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id ?? "";
      if (qte <= 0) {
        const { error } = await supabase
          .from("panier_items")
          .delete()
          .eq("user_id", userId)
          .eq("oeuvre_id", oeuvreId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("panier_items")
          .update({ qte })
          .eq("user_id", userId)
          .eq("oeuvre_id", oeuvreId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panier"] });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (oeuvreId: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { error } = await supabase
        .from("panier_items")
        .delete()
        .eq("user_id", userId)
        .eq("oeuvre_id", oeuvreId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panier"] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { error } = await supabase
        .from("panier_items")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["panier"] });
    },
  });
}

// ============================================================
// Favoris (Supabase)
// ============================================================

export type Favori = {
  id: string;
  oeuvre_id: string;
  created_at: string;
  oeuvre?: Oeuvre;
};

export function useFavoris() {
  return useQuery({
    queryKey: ["favoris"],
    queryFn: async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id ?? "";
      if (!userId) return [];
      const { data, error } = await supabase
        .from("favoris")
        .select("*, oeuvre:oeuvres(*, artiste:artistes(*))")
        .eq("user_id", userId);
      if (error) throw error;
      return data as Favori[];
    },
  });
}

export function useToggleFavori() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (oeuvreId: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: existing } = await supabase
        .from("favoris")
        .select("id")
        .eq("user_id", userId)
        .eq("oeuvre_id", oeuvreId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("favoris").delete().eq("id", existing.id);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase.from("favoris").insert({ user_id: userId, oeuvre_id: oeuvreId });
        if (error) throw error;
        return true;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favoris"] });
    },
  });
}

// ============================================================
// Contact
// ============================================================

export function useSendContact() {
  return useMutation({
    mutationFn: async ({ nom, email, sujet, message }: { nom: string; email: string; sujet: string; message: string }) => {
      const { error } = await supabase
        .from("contacts")
        .insert({ nom, email, sujet, message });
      if (error) throw error;
    },
  });
}

// ============================================================
// Newsletter
// ============================================================

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from("newsletter")
        .insert({ email });
      if (error) throw error;
    },
  });
}

// ============================================================
// Réservations
// ============================================================

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reservation: {
      site_id: string;
      site_nom: string;
      date: string;
      creneau: string;
      personnes: number;
      sous_total: number;
      frais: number;
      montant_total: number;
      nom_contact: string;
      email_contact: string;
      telephone_contact: string;
    }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("Vous devez être connecté pour réserver");

      const ref = `RES-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const { data, error } = await supabase
        .from("reservations")
        .insert({
          ref,
          user_id: userId,
          ...reservation,
          statut: "en_attente",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

// ============================================================
// Dossiers
// ============================================================

export function useDossiers() {
  return useQuery({
    queryKey: ["dossiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("*")
        .order("date_publication", { ascending: false });
      if (error) throw error;
      return data as Dossier[];
    },
  });
}

export function useDossier(slug: string) {
  return useQuery({
    queryKey: ["dossiers", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dossiers")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Dossier;
    },
  });
}

// ============================================================
// Admin – Avis
// ============================================================

export type AvisPlat = {
  id: string;
  user_id: string;
  plat_slug: string;
  note: number;
  commentaire: string | null;
  created_at: string;
};

export function useAdminAvis() {
  return useQuery({
    queryKey: ["admin", "avis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("avis_plats")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AvisPlat[];
    },
  });
}

export function useDeleteAdminAvis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("avis_plats").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "avis"] });
    },
  });
}

// ============================================================
// Admin – Commandes
// ============================================================

export function useAdminCommandes() {
  return useQuery({
    queryKey: ["admin", "commandes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commandes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Commande[];
    },
  });
}

export function useAdminUpdateCommandeStatut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: CommandeStatut }) => {
      const { error } = await supabase
        .from("commandes")
        .update({ statut })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "commandes"] });
    },
  });
}

// ============================================================
// Admin – Utilisateurs
// ============================================================

export function useAdminProfiles() {
  return useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, prenom, nom, profil, statut, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useAdminUpdateProfilStatut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: "valide" | "rejete" }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ statut })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
    },
  });
}

export function useAdminUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, profil }: { id: string; profil: ProfilType }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ profil })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
    },
  });
}
