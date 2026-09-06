import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

function getServerSupabase() {
  const url = import.meta.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Variables Supabase manquantes côté serveur");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const handleKkiapayWebhook = createServerFn({ method: "POST" })
  .validator((input: { payload: unknown }) => {
    if (!input.payload) {
      throw new Error("Payload invalide");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const supabase = getServerSupabase();
    const payload = data.payload as Record<string, unknown>;

    const secretKey = process.env["KKIAPAY_SECRET_KEY"];
    if (!secretKey) {
      throw new Error("KKIAPAY_SECRET_KEY manquante");
    }

    const { kkiapay } = await import("@kkiapay-org/nodejs-sdk");
    const sandboxFlag =
      (process.env["KKIAPAY_SANDBOX"] ?? import.meta.env["VITE_KKIAPAY_SANDBOX"]) !== "false";

    const k = kkiapay({
      privatekey: process.env["KKIAPAY_PRIVATE_KEY"] ?? "",
      publickey: process.env["KKIAPAY_PUBLIC_KEY"] || (import.meta.env["VITE_KKIAPAY_PUBLIC_KEY"] ?? ""),
      secretkey: secretKey,
      sandbox: sandboxFlag,
    });

    const transactionId = payload["transactionId"] as string;
    if (!transactionId) {
      throw new Error("transactionId manquant dans le webhook");
    }

    const transaction = await k.verify(transactionId);

    if (transaction.status === "SUCCESS") {
      await supabase
        .from("commandes")
        .update({ payment_statut: "reussi" })
        .eq("payment_id", transactionId);

      await supabase.from("payments").upsert(
        {
          transaction_id: transactionId,
          amount: transaction.amount,
          fees: transaction.fees,
          method: transaction.source,
          is_success: true,
          performed_at: transaction.performedAt,
          raw_json: transaction,
        },
        { onConflict: "transaction_id" },
      );
    }

    return { status: "ok" };
  });
