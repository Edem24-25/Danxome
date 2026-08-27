import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit-server";

function getServerSupabase() {
  const url = process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Variables Supabase manquantes côté serveur");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type CartItemInput = {
  oeuvre_id: string;
  qte: number;
};

type OeuvreRecord = {
  id: string;
  titre: string;
  prix: number;
  statut: string;
  artiste_id: string | null;
};

type ArtisteRecord = {
  id: string;
  nom: string;
};

type CommandeRecord = {
  id: string;
  oeuvre_titre: string;
  montant: number;
};

type OrderResult = {
  ref: string;
  commandes: CommandeRecord[];
};

export const createOrderFromCart = createServerFn({ method: "POST" })
  .validator((input: { client_id: string; client_nom: string; items: CartItemInput[]; auth_token?: string | undefined }) => {
    if (!input.client_id || typeof input.client_id !== "string") {
      throw new Error("client_id invalide");
    }
    if (!input.client_nom || typeof input.client_nom !== "string") {
      throw new Error("client_nom invalide");
    }
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new Error("Panier vide");
    }
    for (const item of input.items) {
      if (!item.oeuvre_id || typeof item.oeuvre_id !== "string") {
        throw new Error("oeuvre_id invalide");
      }
      if (!Number.isInteger(item.qte) || item.qte < 1 || item.qte > 10) {
        throw new Error("Quantité invalide");
      }
    }
    return input;
  })
  .handler(async ({ data }) => {
    const supabase = getServerSupabase();

    // Authenticate caller identity
    if (!data.auth_token) {
      throw new Error("Authentification requise pour passer une commande.");
    }
    const { data: authData, error: authError } = await supabase.auth.getUser(data.auth_token);
    if (authError || !authData.user || authData.user.id !== data.client_id) {
      throw new Error("Action non autorisée. Session utilisateur invalide.");
    }

    const rl = checkRateLimit(`order:${data.client_id}`, 5, 60_000);
    if (!rl.allowed) {
      throw new Error("Trop de requêtes. Réessayez dans une minute.");
    }

    // 1. Fetch real oeuvre data from DB (source of truth for prices)
    const oeuvreIds = data.items.map((i) => i.oeuvre_id);
    const { data: oeuvres, error: fetchError } = await supabase
      .from("oeuvres")
      .select("id, titre, prix, statut, artiste_id")
      .in("id", oeuvreIds);

    if (fetchError) throw new Error("Erreur lecture œuvres");
    if (!oeuvres || oeuvres.length !== oeuvreIds.length) {
      throw new Error("Certaines œuvres n'existent pas");
    }

    // 2. Verify all oeuvres are available
    for (const oeuvre of oeuvres as OeuvreRecord[]) {
      if (oeuvre.statut !== "publiee") {
        throw new Error(`L'œuvre "${oeuvre.titre}" n'est plus disponible`);
      }
      if (!oeuvre.prix || oeuvre.prix <= 0) {
        throw new Error(`Prix invalide pour "${oeuvre.titre}"`);
      }
    }

    // 3. Fetch artiste names for each oeuvre
    const artisteIds = [
      ...new Set((oeuvres as OeuvreRecord[]).map((o) => o.artiste_id).filter(Boolean)),
    ] as string[];
    const { data: artistes } = await supabase
      .from("artistes")
      .select("id, nom")
      .in("id", artisteIds);

    const artisteMap = new Map(((artistes as ArtisteRecord[]) ?? []).map((a) => [a.id, a.nom]));

    // 4. Generate unique ref server-side
    const ref = `DAH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    // 5. Create orders with server-computed amounts
    const commandes: CommandeRecord[] = [];

    for (const item of data.items) {
      const oeuvre = (oeuvres as OeuvreRecord[]).find((o) => o.id === item.oeuvre_id);
      if (!oeuvre) continue;

      const montant = oeuvre.prix * item.qte;

      const { data: commande, error: insertError } = await supabase
        .from("commandes")
        .insert({
          ref,
          client_id: data.client_id,
          client_nom: data.client_nom,
          oeuvre_id: oeuvre.id,
          oeuvre_titre: oeuvre.titre,
          artiste_nom: artisteMap.get(oeuvre.artiste_id ?? "") ?? "Inconnu",
          montant,
          date: now,
          statut: "recue",
        })
        .select("id, oeuvre_titre, montant")
        .single();

      if (insertError) throw new Error("Erreur création commande");
      commandes.push(commande as CommandeRecord);
    }

    // 6. Mark oeuvres as sold
    for (const item of data.items) {
      await supabase.from("oeuvres").update({ statut: "vendue" }).eq("id", item.oeuvre_id);
    }

    // 7. Clear cart
    await supabase.from("panier_items").delete().eq("user_id", data.client_id);

    return { ref, commandes } satisfies OrderResult;
  });
