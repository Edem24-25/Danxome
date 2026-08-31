import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

function getServerSupabase() {
  const url = process.env["VITE_SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Variables Supabase manquantes côté serveur");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type KkiapayWebhookPayload = {
  transactionId: string;
  isPaymentSucces: boolean;
  account: string | null;
  failureCode?: string;
  failureMessage?: string;
  label?: string;
  method: "MOBILE_MONEY" | "CARD" | "WALLET";
  amount: number;
  fees: number;
  partnerId: string | null;
  performedAt: string;
  stateData?: Record<string, unknown>;
  event: "transaction.success" | "transaction.failed";
};

export const handleKkiapayWebhook = createServerFn({ method: "POST" })
  .validator((input: { payload: KkiapayWebhookPayload; signature: string | null }) => {
    if (!input.payload || !input.payload.transactionId) {
      throw new Error("Payload webhook invalide");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const webhookSecret = process.env["KKIAPAY_WEBHOOK_SECRET"];
    if (!webhookSecret) {
      throw new Error("Secret webhook Kkiapay manquant côté serveur");
    }

    // Verify webhook signature
    if (data.signature !== webhookSecret) {
      throw new Error("Signature webhook invalide");
    }

    const supabase = getServerSupabase();
    const { payload } = data;

    // Update payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        is_success: payload.isPaymentSucces,
        method: payload.method,
        account: payload.account,
        performed_at: payload.performedAt,
        raw_json: payload,
      })
      .eq("transaction_id", payload.transactionId);

    if (paymentError) {
      console.error("Erreur mise à jour payment:", paymentError);
    }

    // Update related commande(s) payment status
    const newPaymentStatut = payload.isPaymentSucces ? "reussi" : "echoue";

    // Find commandes linked to this transaction via payment_id
    const { data: payment } = await supabase
      .from("payments")
      .select("commande_id")
      .eq("transaction_id", payload.transactionId)
      .single();

    if (payment?.commande_id) {
      const { error: commandeError } = await supabase
        .from("commandes")
        .update({ payment_statut: newPaymentStatut })
        .eq("id", payment.commande_id);

      if (commandeError) {
        console.error("Erreur mise à jour commande:", commandeError);
      }

      // If payment failed, revert oeuvre status back to published
      if (!payload.isPaymentSucces) {
        const { data: commandes } = await supabase
          .from("commandes")
          .select("oeuvre_id")
          .eq("id", payment.commande_id);

        if (commandes) {
          for (const cmd of commandes) {
            await supabase.from("oeuvres").update({ statut: "publiee" }).eq("id", cmd.oeuvre_id);
          }
        }
      }
    }

    // Return 200 to acknowledge receipt
    return { status: "ok" };
  });
