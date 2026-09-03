import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { EmptyState, PageHead } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useOeuvres, formatFcfa, usePanier, useAddToCart } from "@/hooks/use-data";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/art/boutique")({
  head: () => ({
    meta: [
      { title: "Boutique d'art béninois — DanXomè" },
      {
        name: "description",
        content:
          "Acquérez sculptures, tentures et bronzes directement auprès des ateliers béninois : filtres par catégorie, région et budget.",
      },
      { property: "og:title", content: "Boutique d'art béninois — DanXomè" },
      {
        property: "og:description",
        content: "Sculptures, tentures et bronzes en vente directe des ateliers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Boutique,
});

const tris = ["Nouveautés", "Prix croissant", "Prix décroissant"] as const;

function Boutique() {
  const { data: panierData } = usePanier();
  const addToCart = useAddToCart();
  const { peutCommander } = useAuth();
  const nombre = (panierData ?? []).reduce((s, i) => s + i.qte, 0);
  const { data: oeuvres, isLoading } = useOeuvres();
  const [cat, setCat] = useState("Toutes");
  const [max, setMax] = useState(350000);
  const [tri, setTri] = useState<(typeof tris)[number]>("Nouveautés");

  const categories = useMemo(
    () => ["Toutes", ...Array.from(new Set((oeuvres ?? []).map((o) => o.categorie)))],
    [oeuvres],
  );

  const liste = useMemo(() => {
    const filtres = (oeuvres ?? []).filter(
      (o) => (cat === "Toutes" || o.categorie === cat) && o.prix <= max,
    );
    if (tri === "Prix croissant") return [...filtres].sort((a, b) => a.prix - b.prix);
    if (tri === "Prix décroissant") return [...filtres].sort((a, b) => b.prix - a.prix);
    return filtres;
  }, [cat, max, tri, oeuvres]);

  if (isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-3 h-4 w-96" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border">
                <Skeleton className="aspect-[4/5] w-full" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHead
        eyebrow="Boutique"
        title="Acheter en direct de l'atelier"
        intro="Pièces uniques, prix affichés sans commission cachée. Le paiement est simulé : ce projet est une démonstration."
        crumbs={[{ label: "Art & artisanat", to: "/art" }, { label: "Boutique" }]}
        aside={
          peutCommander ? (
            <Button asChild variant="gold">
              <Link to="/art/panier">
                <ShoppingBag /> Panier ({nombre})
              </Link>
            </Button>
          ) : undefined
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                <SlidersHorizontal className="size-3.5" /> Catégorie
              </p>
              <div className="mt-4 space-y-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors",
                      c === cat
                        ? "bg-forest text-primary-foreground"
                        : "text-foreground/70 hover:bg-secondary",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Budget maximum
              </p>
              <p className="mt-3 font-display text-2xl text-forest-deep">{formatFcfa(max)}</p>
              <input
                type="range"
                min={50000}
                max={350000}
                step={10000}
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                aria-label="Budget maximum"
                className="mt-4 w-full accent-[oklch(0.735_0.146_82.6)]"
              />
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Trier
              </p>
              <div className="mt-3 space-y-1.5">
                {tris.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTri(t)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                      t === tri
                        ? "bg-secondary font-semibold text-forest-deep"
                        : "text-muted-foreground hover:bg-secondary/60",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              <span className="font-display text-2xl text-forest-deep">{liste.length}</span> pièce
              {liste.length > 1 ? "s" : ""} disponible{liste.length > 1 ? "s" : ""}
            </p>

            {liste.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  icon={<ShoppingBag className="size-5" />}
                  title="Rien dans cette fourchette"
                  description="Augmentez le budget ou changez de catégorie pour voir d'autres œuvres."
                  action={
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCat("Toutes");
                        setMax(350000);
                      }}
                    >
                      Réinitialiser
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {liste.map((o, i) => (
                  <Reveal key={o.slug} delay={i * 60}>
                    <article className="hover-lift flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
                      <Link
                        to="/art/oeuvres/$slug"
                        params={{ slug: o.slug }}
                        className="group block overflow-hidden"
                      >
                        <img
                          src={o.image_url}
                          alt={o.titre}
                          loading="lazy"
                          className="media-warm aspect-[3/4] w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col p-5">
                        <Badge variant="quiet" className="self-start">
                          {o.categorie}
                        </Badge>
                        <h3 className="mt-3 font-display text-lg leading-snug text-forest-deep">
                          <Link to="/art/oeuvres/$slug" params={{ slug: o.slug }}>
                            {o.titre}
                          </Link>
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">{o.artiste?.nom ?? ""}</p>
                        <p className="mt-4 font-display text-xl text-forest-deep">
                          {formatFcfa(o.prix)}
                        </p>
                        <Button
                          asChild={!peutCommander}
                          variant="outline"
                          className="mt-4 w-full"
                          onClick={
                            peutCommander
                              ? () => {
                                  addToCart.mutate({ oeuvreId: o.id });
                                  toast.success("Ajouté au panier");
                                }
                              : undefined
                          }
                        >
                          {peutCommander ? (
                            <>
                              <ShoppingBag /> Ajouter
                            </>
                          ) : (
                            <Link to="/art/oeuvres/$slug" params={{ slug: o.slug }}>
                              <ShoppingBag /> Voir l'œuvre
                            </Link>
                          )}
                        </Button>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
