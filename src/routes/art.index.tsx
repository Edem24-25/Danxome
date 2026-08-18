import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Palette, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { EmptyState, PageHead, Rule, SectionTitle } from "@/components/site/Bits";
import { ContentCard } from "@/components/site/ContentCard";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useArtistes, useOeuvres, formatFcfa } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/art/")({
  head: () => ({
    meta: [
      { title: "Art & artisanat du Bénin — DanXomè" },
      {
        name: "description",
        content:
          "Sculptures, tentures appliquées d'Abomey, bronzes à la cire perdue : découvrez les artistes béninois et acquérez leurs œuvres en direct.",
      },
      { property: "og:title", content: "Art & artisanat du Bénin — DanXomè" },
      {
        property: "og:description",
        content: "Sculptures, textiles et bronzes des ateliers béninois.",
      },
    ],
  }),
  component: Art,
});

function Art() {
  const { data: oeuvres, isLoading: loadingOeuvres } = useOeuvres();
  const { data: artistes, isLoading: loadingArtistes } = useArtistes();
  const [cat, setCat] = useState("Toutes");

  const categories = useMemo(
    () => ["Toutes", ...Array.from(new Set((oeuvres ?? []).map((o) => o.categorie)))],
    [oeuvres],
  );

  const liste = useMemo(
    () => (cat === "Toutes" ? (oeuvres ?? []) : (oeuvres ?? []).filter((o) => o.categorie === cat)),
    [cat, oeuvres],
  );

  if (loadingOeuvres || loadingArtistes) {
    return (
      <SiteShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHead
        eyebrow="Art & artisanat"
        title="Les ateliers, sans intermédiaire"
        intro="Chaque œuvre est documentée avec son atelier, sa matière et son geste. L'intégralité du prix de vente revient à l'artiste, hors frais de logistique."
        crumbs={[{ label: "Art & artisanat" }]}
        aside={
          <Button asChild variant="cultural" className="rounded-full">
            <Link to="/art/boutique">
              <ShoppingBag /> Entrer dans la boutique
            </Link>
          </Button>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Reveal variant="up">
          <SectionTitle
            eyebrow="Sélection"
            title="Œuvres en lumière"
            intro="Une grille asymétrique, comme un accrochage : les pièces majeures prennent plus de place."
          />
        </Reveal>

        {/* ═══ FILTRES CATÉGORIES ═══ */}
        <Reveal variant="up" delay={80}>
          <div className="mt-7 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300",
                  c === cat
                    ? "border-accent bg-accent text-accent-foreground shadow-gold"
                    : "border-border text-foreground/70 hover:border-accent/50 hover:shadow-sm",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        {/* ═══ GRILLE ŒUVRES ═══ */}
        {liste.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<Palette className="size-5" />}
              title="Aucune œuvre dans cette catégorie"
              description="Revenez bientôt : les ateliers déposent de nouvelles pièces chaque mois."
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {liste.map((o, i) => (
              <Reveal
                key={o.slug}
                variant="up"
                delay={i * 70}
                className={i % 5 === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
              >
                <ContentCard
                  to="/art/oeuvres/$slug"
                  params={{ slug: o.slug }}
                  image={o.image_url}
                  titre={o.titre}
                  meta={`${o.categorie} · ${o.artiste?.nom ?? ""}`}
                  resume={o.description}
                  ratio={i % 5 === 0 ? "paysage" : "portrait"}
                  footer={formatFcfa(o.prix)}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        )}

        <Rule />

        {/* ═══ ARTISTES ═══ */}
        <Reveal variant="up">
          <SectionTitle
            eyebrow="Les mains"
            title="Artistes & artisans"
            intro="Sculpteurs, tisseuses, bronziers : des ateliers familiaux aux pratiques contemporaines."
          />
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(artistes ?? []).map((a, i) => (
            <Reveal key={a.slug} variant="up" delay={i * 80}>
              <ContentCard
                to="/art/artistes/$slug"
                params={{ slug: a.slug }}
                image={a.image_url}
                titre={a.nom}
                meta={`${a.metier} · ${a.ville}`}
                resume={a.bio}
                ratio="carre"
              />
            </Reveal>
          ))}
        </div>

        <Rule />

        {/* ═══ CTA ARTISTE ═══ */}
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-2xl bg-forest-darker">
            <img
              src="/Botchio gardien_danxomè.jpg"
              alt="Atelier de sculpture"
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-30"
            />
            <div className="absolute inset-0 texture-grain" aria-hidden />
            <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-[minmax(0,1.4fr)_auto] lg:items-center">
              <div>
                <p className="eyebrow-gold">Vous êtes artiste ?</p>
                <h2 className="mt-3 font-display text-3xl text-ivory sm:text-4xl">
                  Ouvrez votre galerie sur DanXomè
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ivory/70">
                  Publiez vos œuvres, suivez vos ventes et recevez des dons du public. L'espace
                  artiste est gratuit pour les ateliers basés au Bénin.
                </p>
              </div>
              <Button asChild variant="gold" size="lg" className="rounded-full">
                <Link to="/artiste">
                  Espace artiste <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
