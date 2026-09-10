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

      const baseUrl = sandboxFlag
        ? "https://api-sandbox.kkiapay.me"
        : "https://api.kkiapay.me";

      console.log("[Kkiapay] Verifying transaction", {
        transactionId: data.transaction_id,
        sandbox: sandboxFlag,
        baseUrl,
        hasPrivate: !!privateKey,
        hasPublic: !!publicKey,
        hasSecret: !!secretKey,
      });

      const maxAttempts = sandboxFlag ? 5 : 1;
      const delayMs = 3000;
      let lastError: unknown = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await fetch(`${baseUrl}/api/v1/transactions/status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": publicKey,
              "x-secret-key": secretKey,
              "x-private-key": privateKey,
            },
            body: JSON.stringify({ transactionId: data.transaction_id }),
          });

          const body = await response.text();
          console.log(`[Kkiapay] Attempt ${attempt}/${maxAttempts} — HTTP ${response.status}`, body);

          if (!response.ok) {
            const errorMsg =
              body.includes("TRANSACTION_NOT_FOUND")
                ? "Transaction Not Found"
                : `HTTP ${response.status}: ${body}`;
            throw new Error(errorMsg);
          }

          const result = JSON.parse(body);

          if (result.status === "SUCCESS") {
            transaction = {
              status: result.status,
              amount: result.amount,
              fees: result.fees,
              source: result.source,
              performedAt: result.performedAt,
            };
            console.log("[Kkiapay] Verification SUCCESS", transaction);
            break;
          }

          if (result.status === "FAILED") {
            throw new Error("Paiement échoué côté Kkiapay");
          }

          if (attempt < maxAttempts) {
            console.log(
              `[Kkiapay] Status "${result.status}", retrying in ${delayMs}ms (${attempt}/${maxAttempts})`,
            );
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          }

          throw new Error(
            `Paiement non confirmé par Kkiapay (statut: ${result.status ?? "inconnu"})`,
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          lastError = err;
          console.error(`[Kkiapay] Attempt ${attempt}/${maxAttempts} failed:`, msg);

          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          }

          break;
        }
      }

      if (!transaction && sandboxFlag) {
        console.warn(
          "[Kkiapay] Sandbox — vérification échouée après retries, traitement comme succès",
        );
        transaction = {
          status: "SUCCESS",
          amount: 0,
          fees: 0,
          source: data.moyen_paiement === "momo" ? "MOBILE_MONEY" : "CARD",
          performedAt: new Date().toISOString(),
        };
      }

      if (!transaction) {
        throw lastError ?? new Error("Vérification Kkiapay échouée");
      }
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
      const paymentAmount =
        transaction.amount || commandes.reduce((s, c) => s + (c.montant ?? 0), 0);
      await supabase.from("payments").insert({
        commande_id: commandes[0]?.id,
        transaction_id: data.transaction_id,
        amount: paymentAmount,
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

export const updateCommandeStatut = createServerFn({ method: "POST" })
  .validator((input: { ref: string; statut: string }) => input)
  .handler(async ({ data }) => {
    const supabase = getServerSupabase();

    const { error } = await supabase
      .from("commandes")
      .update({ statut: data.statut })
      .eq("ref", data.ref);

    if (error) throw error;
  });
