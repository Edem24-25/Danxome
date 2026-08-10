import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, PackageCheck, ShoppingBag } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead } from "@/components/site/Bits";
import { Button } from "@/components/ui/button";

type Search = { ref?: string };

export const Route = createFileRoute("/art/commande/succes")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["ref"] === "string" ? { ref: search["ref"] } : {},
  head: () => ({
    meta: [
      { title: "Paiement réussi — Dãhomè" },
      {
        name: "description",
        content: "Votre commande a bien été enregistrée. Les ateliers sont notifiés.",
      },
      { property: "og:title", content: "Paiement réussi — Dãhomè" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Succes,
});

const etapes = [
  {
    titre: "Atelier notifié",
    desc: "L'artisan prépare votre pièce, souvent une œuvre unique réalisée sur commande.",
  },
  {
    titre: "Expédition soignée",
    desc: "Emballage sécurisé et numéro de suivi envoyé par e-mail dès la mise en caisse.",
  },
  {
    titre: "Livraison au Bénin",
    desc: "Livraison sous 3 à 7 jours ouvrés selon le département, Mobile Money ou à l'atelier.",
  },
];

function Succes() {
  const { ref } = Route.useSearch();
  const reference =
    ref || `DAH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <SiteShell>
      <PageHead
        eyebrow="Paiement"
        title="Paiement réussi !"
        intro="Votre commande est confirmée et les ateliers concernés viennent d'être notifiés. Merci pour votre soutien aux artisans béninois."
        crumbs={[
          { label: "Art & artisanat", to: "/art" },
          { label: "Panier", to: "/art/panier" },
          { label: "Confirmation" },
        ]}
      />

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex flex-col items-center bg-forest/5 px-6 py-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-forest shadow-lg shadow-forest/25">
              <Check className="size-8 text-primary-foreground" strokeWidth={3} />
            </div>
            <h2 className="mt-5 font-display text-2xl text-forest-deep">Commande {reference}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Un e-mail de confirmation vous a été envoyé.
            </p>
          </div>

          <div className="px-6 py-8 sm:px-10">
            <div className="grid gap-6 sm:grid-cols-3">
              {etapes.map((e, i) => (
                <div key={e.titre} className="relative rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-forest-deep">{e.titre}</p>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{e.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" className="flex-1">
                <Link to="/profil">
                  <PackageCheck className="size-4" /> Suivre ma commande
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/art/boutique">
                  <ShoppingBag className="size-4" /> Retour à la boutique
                </Link>
              </Button>
            </div>
            <p className="mt-6 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
              Une question sur votre commande ?
              <Link
                to="/contact"
                className="inline-flex items-center font-semibold text-terracotta hover:underline"
              >
                Contactez-nous <ChevronRight className="size-3" />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
