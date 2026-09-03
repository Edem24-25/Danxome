import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, Lock, ShoppingBag, Smartphone } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site/SiteShell";
import { EmptyState, PageHead } from "@/components/site/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFcfa, usePanier } from "@/hooks/use-data";
import { useAuth } from "@/contexts/auth";
import { accueilProfil } from "@/lib/types/user";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    openKkiapayWidget?: (options: Record<string, unknown>) => void;
    addSuccessListener?: (cb: (response: { transactionId: string }) => void) => void;
    addFailedListener?: (cb: () => void) => void;
    removeSuccessListener?: (cb: (response: { transactionId: string }) => void) => void;
    removeFailedListener?: (cb: () => void) => void;
  }
}

export const Route = createFileRoute("/art/checkout")({
  head: () => ({
    meta: [
      { title: "Finaliser ma commande — DanXomè" },
      {
        name: "description",
        content:
          "Livraison, moyen de paiement et confirmation : finalisez l'acquisition de vos œuvres béninoises en quelques champs.",
      },
      { property: "og:title", content: "Finaliser ma commande — DanXomè" },
      { property: "og:description", content: "Livraison, paiement et confirmation de commande." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const moyens = [
  { id: "momo", label: "Mobile Money (MTN / Moov)", icon: Smartphone },
  { id: "carte", label: "Carte bancaire", icon: CreditCard },
] as const;

function Checkout() {
  const navigate = useNavigate();
  const { data } = usePanier();
  const { peutCommander, profile, user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [moyen, setMoyen] = useState<string>("momo");
  const [enCours, setEnCours] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const articles = data ?? [];
  const total = articles.reduce((s, i) => s + (i.oeuvre?.prix ?? 0) * i.qte, 0);
  const livraison = articles.length > 0 ? 12000 : 0;

  const pendingOrderRef = useRef<{
    userId: string;
    clientNom: string;
    items: { oeuvre_id: string; qte: number }[];
    moyen: string;
    token: string | undefined;
  } | null>(null);
  const processingRef = useRef(false);
  const listenersCleanedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.kkiapay.me/k.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const cleanupListeners = useCallback(() => {
    if (listenersCleanedRef.current) return;
    listenersCleanedRef.current = true;
    try {
      if (window.removeSuccessListener) {
        window.removeSuccessListener(onSuccessRef.current!);
      }
      if (window.removeFailedListener) {
        window.removeFailedListener(onFailedRef.current!);
      }
    } catch {
      // ignore cleanup errors
    }
    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
  }, []);

  const onSuccessRef = useRef<((response: { transactionId: string }) => void) | null>(null);
  const onFailedRef = useRef<(() => void) | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const payer = async () => {
    if (!user?.id) {
      toast.error("Erreur", { description: "Vous devez être connecté pour commander." });
      return;
    }

    if (!window.openKkiapayWidget || !window.addSuccessListener || !window.addFailedListener) {
      toast.error("Erreur", { description: "Le module de paiement n'est pas encore chargé." });
      return;
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    pendingOrderRef.current = {
      userId: user.id,
      clientNom: `${profile?.prenom ?? ""} ${profile?.nom ?? ""}`.trim(),
      items: articles.filter((a) => a.oeuvre).map((a) => ({ oeuvre_id: a.oeuvre!.id, qte: a.qte })),
      moyen,
      token: token || undefined,
    };

    processingRef.current = false;
    listenersCleanedRef.current = false;
    setEnCours(true);

    function onSuccess(response: { transactionId: string }) {
      if (processingRef.current) return;
      processingRef.current = true;
      console.log("[Kkiapay] onSuccess", response);
      cleanupListeners();
      processPayment(response.transactionId);
    }

    function onFailed() {
      if (processingRef.current) return;
      processingRef.current = true;
      console.log("[Kkiapay] onFailed");
      cleanupListeners();
      setEnCours(false);
      pendingOrderRef.current = null;
      toast.error("Paiement échoué", { description: "Paiement annulé ou échoué." });
    }

    onSuccessRef.current = onSuccess;
    onFailedRef.current = onFailed;

    window.addSuccessListener(onSuccess);
    window.addFailedListener(onFailed);

    function handleMessage(event: MessageEvent) {
      if (processingRef.current) return;
      try {
        const d = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (d && d.transactionId && !d.error) {
          if (processingRef.current) return;
          processingRef.current = true;
          console.log("[Kkiapay] message event", d);
          cleanupListeners();
          processPayment(d.transactionId);
        }
        if (d && d.error) {
          if (processingRef.current) return;
          processingRef.current = true;
          console.log("[Kkiapay] message error", d);
          cleanupListeners();
          setEnCours(false);
          pendingOrderRef.current = null;
          toast.error("Paiement échoué");
        }
      } catch {
        // ignore non-JSON messages
      }
    }
    messageHandlerRef.current = handleMessage;
    window.addEventListener("message", handleMessage);

    window.openKkiapayWidget({
      amount: total + livraison,
      phone: phoneNumber || undefined,
      name: `${profile?.prenom ?? ""} ${profile?.nom ?? ""}`.trim(),
      email: user.email ?? undefined,
      data: JSON.stringify({ client_id: user.id }),
      paymentmethod: moyen === "momo" ? ["momo"] : ["card"],
      sandbox: import.meta.env["VITE_KKIAPAY_SANDBOX"] !== "false",
      key: import.meta.env["VITE_KKIAPAY_PUBLIC_KEY"],
      position: "center",
      theme: "#065f46",
    });
  };

  async function processPayment(transactionId: string) {
    const pending = pendingOrderRef.current;
    if (!pending) {
      console.log("[Kkiapay] no pending order");
      return;
    }

    try {
      const { createOrderFromCart } = await import("@/server-functions/commands");
      const result = await createOrderFromCart({
        data: {
          client_id: pending.userId,
          client_nom: pending.clientNom,
          items: pending.items,
          transaction_id: transactionId,
          moyen_paiement: pending.moyen,
          auth_token: pending.token,
        },
      });

      console.log("[Kkiapay] order created", result);
      toast.success("Commande confirmée !");
      navigate({ to: "/art/commande/succes", search: { ref: result.ref } });
    } catch (err) {
      console.error("[Kkiapay] order error", err);
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error("Erreur commande", { description: message });
      navigate({ to: "/art/commande/erreur", search: { motif: "erreur-serveur" } });
    } finally {
      setEnCours(false);
      pendingOrderRef.current = null;
      processingRef.current = false;
    }
  }

  if (!mounted || loading) {
    return (
      <SiteShell>
        <PageHead
          eyebrow="Checkout"
          title="Livraison & paiement"
          crumbs={[
            { label: "Art & artisanat", to: "/art" },
            { label: "Panier", to: "/art/panier" },
            { label: "Commande" },
          ]}
        />
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 space-y-6">
          <Skeleton className="h-12 w-full max-w-md rounded-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </section>
      </SiteShell>
    );
  }

  if (!peutCommander) {
    return (
      <SiteShell>
        <PageHead
          eyebrow="Checkout"
          title="Livraison & paiement"
          crumbs={[
            { label: "Art & artisanat", to: "/art" },
            { label: "Panier", to: "/art/panier" },
            { label: "Commande" },
          ]}
        />
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <EmptyState
            icon={<ShoppingBag className="size-5" />}
            title="Réservé aux visiteurs"
            description="Seuls les visiteurs peuvent passer commande. Artistes et artisans, retrouvez vos commandes reçues dans votre espace."
            action={
              <Button asChild variant="gold">
                <Link to={accueilProfil(profile?.profil)}>Accéder à mon espace</Link>
              </Button>
            }
          />
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHead
        eyebrow="Checkout"
        title="Livraison & paiement"
        crumbs={[
          { label: "Art & artisanat", to: "/art" },
          { label: "Panier", to: "/art/panier" },
          { label: "Commande" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {articles.length === 0 ? (
          <EmptyState
            title="Aucun article à commander"
            description="Ajoutez au moins une œuvre à votre panier pour poursuivre."
            action={
              <Button asChild variant="gold">
                <Link to="/art/boutique">Aller à la boutique</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
                <h2 className="font-display text-2xl text-forest-deep">Adresse de livraison</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="nom">Nom complet</Label>
                    <Input id="nom" className="mt-2" placeholder="Aïssatou Dossou" />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" className="mt-2" placeholder="vous@exemple.bj" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="adresse">Adresse</Label>
                    <Input id="adresse" className="mt-2" placeholder="Rue 12.345, quartier…" />
                  </div>
                  <div>
                    <Label htmlFor="ville">Ville</Label>
                    <Input id="ville" className="mt-2" placeholder="Cotonou" />
                  </div>
                  <div>
                    <Label htmlFor="pays">Pays</Label>
                    <Input id="pays" className="mt-2" defaultValue="Bénin" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
                <h2 className="font-display text-2xl text-forest-deep">Moyen de paiement</h2>
                <div className="mt-6 space-y-3">
                  {moyens.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMoyen(m.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-sm font-semibold transition-colors",
                        moyen === m.id
                          ? "border-accent bg-accent/10 text-forest-deep"
                          : "border-border text-foreground/70 hover:border-accent/50",
                      )}
                    >
                      <m.icon className="size-4 text-accent" /> {m.label}
                    </button>
                  ))}
                </div>
                {moyen === "momo" && (
                  <div className="mt-5">
                    <Label htmlFor="tel">Numéro Mobile Money</Label>
                    <Input
                      id="tel"
                      className="mt-2"
                      placeholder="+229 97 00 00 00"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                )}
                <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-3.5 text-forest" /> Paiement sécurisé — vos données ne sont
                  jamais stockées.
                </p>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="eyebrow">Votre commande</p>
                <ul className="mt-5 space-y-3">
                  {articles.map((item) => {
                    const oeuvre = item.oeuvre;
                    if (!oeuvre) return null;
                    return (
                      <li key={oeuvre.slug} className="flex items-center gap-3">
                        <img
                          src={oeuvre.image_url}
                          alt={oeuvre.titre}
                          className="media-warm size-12 rounded-md object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-forest-deep">
                            {oeuvre.titre}
                          </span>
                          <span className="block text-xs text-muted-foreground">× {item.qte}</span>
                        </span>
                        <span className="text-sm font-semibold text-forest">
                          {formatFcfa(oeuvre.prix * item.qte)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="font-semibold text-forest-deep">{formatFcfa(total)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Logistique</span>
                    <span className="font-semibold text-forest-deep">{formatFcfa(livraison)}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Total
                  </span>
                  <span className="font-display text-2xl text-forest-deep">
                    {formatFcfa(total + livraison)}
                  </span>
                </div>
                <Button variant="gold" className="mt-6 w-full" onClick={payer} disabled={enCours}>
                  {enCours ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Paiement en cours…
                    </span>
                  ) : (
                    <>Payer {formatFcfa(total + livraison)}</>
                  )}
                </Button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
