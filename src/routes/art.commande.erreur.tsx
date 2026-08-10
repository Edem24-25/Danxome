import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw, ShoppingBag, X, XCircle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead } from "@/components/site/Bits";
import { Button } from "@/components/ui/button";

type Search = { motif?: string };

const motifsConnus = [
  "paiement-refuse",
  "carte-sans-fonds",
  "solde-insuffisant",
  "annule",
] as const;

export const Route = createFileRoute("/art/commande/erreur")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["motif"] === "string" ? { motif: search["motif"] } : {},
  head: () => ({
    meta: [
      { title: "Paiement échoué — Dãhomè" },
      {
        name: "description",
        content: "Le paiement n'a pas abouti. Vérifiez vos informations et réessayez.",
      },
      { property: "og:title", content: "Paiement échoué — Dãhomè" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Erreur,
});

const messages: Record<string, string> = {
  "paiement-refuse":
    "Votre banque ou opérateur Mobile Money a refusé la transaction. Vérifiez le solde ou le plafond de votre compte.",
  "carte-sans-fonds":
    "Le solde de votre carte est insuffisant pour couvrir le montant de la commande.",
  "solde-insuffisant":
    "Le solde de votre compte Mobile Money est insuffisant pour couvrir le montant de la commande.",
  annule: "Vous avez annulé le paiement avant sa confirmation.",
};

function Erreur() {
  const { motif } = Route.useSearch();
  const message =
    motif && messages[motif]
      ? messages[motif]
      : "La transaction n'a pas abouti. Aucun montant n'a été débité. Vous pouvez réessayer ou vérifier vos informations de paiement.";

  return (
    <SiteShell>
      <PageHead
        eyebrow="Paiement"
        title="Le paiement a échoué"
        intro="Aucun montant n'a été débité. Corrigez le problème indiqué ci-dessous et réessayez."
        crumbs={[
          { label: "Art & artisanat", to: "/art" },
          { label: "Panier", to: "/art/panier" },
          { label: "Paiement échoué" },
        ]}
      />

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center bg-destructive/5 px-6 py-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive shadow-lg shadow-destructive/25">
              <X className="size-8 text-destructive-foreground" strokeWidth={3} />
            </div>
            <h2 className="mt-5 font-display text-2xl text-forest-deep">Transaction refusée</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{message}</p>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <div className="rounded-lg border border-border bg-secondary/40 p-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Conseils
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  Vérifiez le numéro (Mobile Money) ou la carte et la date d'expiration.
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  Assurez-vous d'avoir un solde suffisant et un plafond adapté.
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  Réessayez dans quelques minutes ou utilisez un autre moyen de paiement.
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" className="flex-1">
                <Link to="/art/checkout">
                  <RefreshCw className="size-4" /> Réessayer le paiement
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/art/panier">
                  <ShoppingBag className="size-4" /> Retour au panier
                </Link>
              </Button>
            </div>
            <Button asChild variant="ghost" className="mt-3 w-full">
              <Link to="/contact">
                <ArrowLeft className="size-4" /> Contacter l'assistance
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
