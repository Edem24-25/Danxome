import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit-server";

function getServerSupabase() {
  const url = import.meta.env["VITE_SUPABASE_URL"];
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
  .validator(
    (input: {
      client_id: string;
      client_nom: string;
      items: CartItemInput[];
      transaction_id?: string;
      moyen_paiement?: string;
      auth_token?: string | undefined;
    }) => {
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
    },
  )
  .handler(async ({ data }) => {
    const supabase = getServerSupabase();

    if (!data.auth_token) {
      throw new Error("Authentification requise pour passer une commande.");
    }
    const { data: authData, error: authError } = await supabase.auth.getUser(data.auth_token);
    if (authError || !authData.user || authData.user.id !== data.client_id) {
      throw new Error("Action non autorisée. Session utilisateur invalide.");
    }

    const rl = checkRateLimit(`order:${data.client_id}`, 10, 7_200_000);
    if (!rl.allowed) {
      throw new Error("Trop de requêtes. Réessayez dans une minute.");
    }

    let transaction: {
      status: string;
      amount: number;
      fees: number;
      source: string;
      performedAt: string;
    } | null = null;

    if (data.transaction_id) {
      const { kkiapay } = await import("@kkiapay-org/nodejs-sdk");

      const privateKey = process.env["KKIAPAY_PRIVATE_KEY"];
      const publicKey =
        process.env["KKIAPAY_PUBLIC_KEY"] || import.meta.env["VITE_KKIAPAY_PUBLIC_KEY"];
      const secretKey = process.env["KKIAPAY_SECRET_KEY"];
      const sandboxFlag =
        (process.env["KKIAPAY_SANDBOX"] ?? import.meta.env["VITE_KKIAPAY_SANDBOX"]) !== "false";

      if (!privateKey || !publicKey || !secretKey) {
        console.error("[Kkiapay] Missing keys:", {
          hasPrivate: !!privateKey,
          hasPublic: !!publicKey,
          hasSecret: !!secretKey,
        });
        throw new Error("Clés Kkiapay manquantes côté serveur");
      }

      console.log("[Kkiapay] Verifying transaction", {
        transactionId: data.transaction_id,
        sandbox: sandboxFlag,
      });

      const k = kkiapay({
        privatekey: privateKey,
        publickey: publicKey,
        secretkey: secretKey,
        sandbox: sandboxFlag,
      });

      const result = await k.verify(data.transaction_id);
      console.log("[Kkiapay] Verification result:", result);

      if (result.status !== "SUCCESS") {
        throw new Error(
          `Paiement non confirmé par Kkiapay (statut: ${result.status ?? "inconnu"})`,
        );
      }
      transaction = result;
    }

    const oeuvreIds = data.items.map((i) => i.oeuvre_id);
    const { data: oeuvres, error: fetchError } = await supabase
      .from("oeuvres")
      .select("id, titre, prix, statut, artiste_id")
      .in("id", oeuvreIds);

    if (fetchError) throw new Error("Erreur lecture œuvres");
    if (!oeuvres || oeuvres.length !== oeuvreIds.length) {
      throw new Error("Certaines œuvres n'existent pas");
    }

    for (const oeuvre of oeuvres as OeuvreRecord[]) {
      if (oeuvre.statut !== "publiee") {
        throw new Error(`L'œuvre "${oeuvre.titre}" n'est plus disponible`);
      }
      if (!oeuvre.prix || oeuvre.prix <= 0) {
        throw new Error(`Prix invalide pour "${oeuvre.titre}"`);
      }
    }

    const artisteIds = [
      ...new Set((oeuvres as OeuvreRecord[]).map((o) => o.artiste_id).filter(Boolean)),
    ] as string[];
    const { data: artistes } = await supabase
      .from("artistes")
      .select("id, nom")
      .in("id", artisteIds);

    const artisteMap = new Map(((artistes as ArtisteRecord[]) ?? []).map((a) => [a.id, a.nom]));

    const orderRef = `DAH-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();

    const commandInserts = data.items
      .map((item, index) => {
        const oeuvre = (oeuvres as OeuvreRecord[]).find((o) => o.id === item.oeuvre_id);
        if (!oeuvre) return null;

        const montant = oeuvre.prix * item.qte;

        return {
          ref: `${orderRef}-${String(index + 1).padStart(2, "0")}`,
          client_id: data.client_id,
          client_nom: data.client_nom,
          oeuvre_id: oeuvre.id,
          oeuvre_titre: oeuvre.titre,
          artiste_nom: artisteMap.get(oeuvre.artiste_id ?? "") ?? "Inconnu",
          montant,
          date: now,
          statut: "recue",
          payment_id: data.transaction_id ?? null,
          moyen_paiement: data.moyen_paiement ?? "momo",
          payment_statut: transaction ? "reussi" : "en_attente",
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const { data: insertedCommandes, error: batchInsertError } = await supabase
      .from("commandes")
      .insert(commandInserts)
      .select("id, oeuvre_titre, montant");

    if (batchInsertError) {
      console.error("Supabase insert error:", batchInsertError);
      throw new Error(`Erreur création commandes: ${batchInsertError.message}`);
    }
    const commandes = (insertedCommandes ?? []) as CommandeRecord[];

    if (transaction && data.transaction_id) {
      await supabase.from("payments").insert({
        commande_id: commandes[0]?.id,
        transaction_id: data.transaction_id,
        amount: transaction.amount,
        fees: transaction.fees,
        method: transaction.source,
        is_success: transaction.status === "SUCCESS",
        partner_id: null,
        account: null,
        performed_at: transaction.performedAt,
        raw_json: transaction,
      });
    }

    await supabase.from("oeuvres").update({ statut: "vendue" }).in("id", oeuvreIds);

    await supabase.from("panier_items").delete().eq("user_id", data.client_id);

    return { ref: orderRef, commandes } satisfies OrderResult;
  });
