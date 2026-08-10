import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { EmptyState, LoadingRows, PageHead } from "@/components/site/Bits";
import { Button } from "@/components/ui/button";
import { formatFcfa } from "@/lib/data";
import { usePanier } from "@/lib/cart";
import { useAuth } from "@/contexts/auth";
import { accueilProfil } from "@/lib/types/user";

export const Route = createFileRoute("/art/panier")({
  head: () => ({
    meta: [
      { title: "Mon panier — Dãhomè" },
      {
        name: "description",
        content:
          "Vérifiez les œuvres sélectionnées, ajustez les quantités et passez à la finalisation de votre commande d'art béninois.",
      },
      { property: "og:title", content: "Mon panier — Dãhomè" },
      { property: "og:description", content: "Vos œuvres sélectionnées avant commande." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Panier,
});

function Panier() {
  const { articles, total, pret, definir, retirer, vider } = usePanier();
  const { peutCommander, profile } = useAuth();
  const livraison = articles.length > 0 ? 12000 : 0;

  if (!peutCommander) {
    return (
      <SiteShell>
        <PageHead
          eyebrow="Panier"
          title="Vos œuvres sélectionnées"
          crumbs={[
            { label: "Art & artisanat", to: "/art" },
            { label: "Boutique", to: "/art/boutique" },
            { label: "Panier" },
          ]}
        />
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <EmptyState
            icon={<ShoppingBag className="size-5" />}
            title="Le panier est réservé aux visiteurs"
            description="Artistes et artisans, votre espace dédié vous permet de suivre vos commandes reçues, votre vitrine et vos versements."
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
        eyebrow="Panier"
        title="Vos œuvres sélectionnées"
        crumbs={[
          { label: "Art & artisanat", to: "/art" },
          { label: "Boutique", to: "/art/boutique" },
          { label: "Panier" },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {!pret ? (
          <LoadingRows rows={3} />
        ) : articles.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-5" />}
            title="Votre panier est vide"
            description="Parcourez la boutique : chaque pièce est unique et part directement de l'atelier."
            action={
              <Button asChild variant="gold">
                <Link to="/art/boutique">Découvrir la boutique</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="divide-y divide-border rounded-lg border border-border bg-card">
              {articles.map(({ oeuvre, qte }) => (
                <div key={oeuvre.slug} className="flex gap-4 p-5">
                  <Link
                    to="/art/oeuvres/$slug"
                    params={{ slug: oeuvre.slug }}
                    className="shrink-0 overflow-hidden rounded-md"
                  >
                    <img
                      src={oeuvre.image}
                      alt={oeuvre.titre}
                      className="media-warm size-24 object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg text-forest-deep">
                      <Link to="/art/oeuvres/$slug" params={{ slug: oeuvre.slug }}>
                        {oeuvre.titre}
                      </Link>
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {oeuvre.categorie} · {oeuvre.artiste}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Diminuer la quantité"
                          onClick={() => definir(oeuvre.slug, qte - 1)}
                        >
                          <Minus />
                        </Button>
                        <span className="w-6 text-center font-semibold">{qte}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label="Augmenter la quantité"
                          onClick={() => definir(oeuvre.slug, qte + 1)}
                        >
                          <Plus />
                        </Button>
                      </div>
                      <button
                        onClick={() => retirer(oeuvre.slug)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:underline"
                      >
                        <Trash2 className="size-3.5" /> Retirer
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 font-display text-lg text-forest-deep">
                    {formatFcfa(oeuvre.prix * qte)}
                  </p>
                </div>
              ))}
              <div className="p-5">
                <button
                  onClick={vider}
                  className="text-xs font-semibold text-muted-foreground hover:underline"
                >
                  Vider le panier
                </button>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="eyebrow">Récapitulatif</p>
                <dl className="mt-5 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Sous-total</dt>
                    <dd className="font-semibold text-forest-deep">{formatFcfa(total)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Logistique & caisse bois</dt>
                    <dd className="font-semibold text-forest-deep">{formatFcfa(livraison)}</dd>
                  </div>
                </dl>
                <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
                  <span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    Total
                  </span>
                  <span className="font-display text-2xl text-forest-deep">
                    {formatFcfa(total + livraison)}
                  </span>
                </div>
                <Button asChild variant="gold" className="mt-6 w-full">
                  <Link to="/art/checkout">
                    Finaliser la commande <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="mt-2 w-full">
                  <Link to="/art/boutique">Continuer mes achats</Link>
                </Button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
