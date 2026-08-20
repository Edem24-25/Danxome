import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, LayoutGrid, List, SlidersHorizontal, Trash2 } from "lucide-react";
import { ProfilShell } from "@/components/site/ProfilShell";
import { EmptyState, SectionTitle } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOeuvres, formatFcfa, useFavoris, useToggleFavori } from "@/hooks/use-data";

export const Route = createFileRoute("/profil/favoris")({
  head: () => ({
    meta: [
      { title: "Mes favoris — DanXomè" },
      { name: "description", content: "Vos œuvres d'art favorites sur DanXomè." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilFavoris,
});

type SortKey = "recent" | "prix-asc" | "prix-desc" | "titre";

function ProfilFavoris() {
  const { data: favorisData } = useFavoris();
  const toggleFavori = useToggleFavori();
  const { data: oeuvres = [], isLoading: oeuvresLoading } = useOeuvres();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [selectedCat, setSelectedCat] = useState<string>("toutes");

  const favorisIds = useMemo(() => (favorisData ?? []).map((f) => f.oeuvre_id), [favorisData]);

  const categories = useMemo(() => {
    const cats = new Set(oeuvres.filter((o) => favorisIds.includes(o.id)).map((o) => o.categorie).filter(Boolean));
    return ["toutes", ...Array.from(cats)];
  }, [oeuvres, favorisIds]);

  const liste = useMemo(() => {
    const items = oeuvres.filter((o) => favorisIds.includes(o.id));
    const filtered = selectedCat === "toutes" ? items : items.filter((o) => o.categorie === selectedCat);
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "prix-asc":
          return (a.prix ?? 0) - (b.prix ?? 0);
        case "prix-desc":
          return (b.prix ?? 0) - (a.prix ?? 0);
        case "titre":
          return a.titre.localeCompare(b.titre);
        default:
          return 0;
      }
    });
  }, [oeuvres, favorisIds, sortBy, selectedCat]);

  return (
    <ProfilShell
      title="Mes favoris"
      crumbs={[{ label: "Mon profil", to: "/profil" }, { label: "Favoris" }]}
    >
      {/* Header avec compteurs */}
      <Reveal variant="up">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <SectionTitle
            eyebrow="Œuvres"
            title={`${liste.length} favori${liste.length !== 1 ? "s" : ""}`}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-2 transition-colors ${viewMode === "grid" ? "bg-forest text-ivory" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              aria-label="Vue grille"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-2 transition-colors ${viewMode === "list" ? "bg-forest text-ivory" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
              aria-label="Vue liste"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </Reveal>

      {/* Filtres */}
      {!oeuvresLoading && liste.length > 0 && (
        <Reveal variant="up" delay={100}>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    selectedCat === cat
                      ? "bg-forest text-ivory shadow-sm"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  {cat === "toutes" ? "Toutes" : cat}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="ml-auto rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-forest/20"
            >
              <option value="recent">Récents</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
              <option value="titre">Alphabétique</option>
            </select>
          </div>
        </Reveal>
      )}

      {/* Chargement */}
      {oeuvresLoading ? (
        <div className={`mt-2 gap-6 ${viewMode === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            viewMode === "grid" ? (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <Skeleton className="size-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            )
          ))}
        </div>
      ) : liste.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-5" />}
          title={
            selectedCat !== "toutes"
              ? `Aucun favori dans « ${selectedCat} »`
              : "Aucun favori pour l'instant"
          }
          description="Explorez la boutique et touchez le cœur pour garder vos coups de cœur à portée de main."
          action={
            <Button asChild variant="gold">
              <Link to="/art/boutique">Découvrir la boutique</Link>
            </Button>
          }
        />
      ) : viewMode === "grid" ? (
        /* ═══ VUE GRILLE ═══ */
        <div className="mt-2 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {liste.map((o, i) => (
            <Reveal key={o.slug} delay={i * 60}>
              <article className="hover-lift flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="relative">
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
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Retirer ${o.titre} des favoris`}
                    onClick={() => toggleFavori.mutate(o.id)}
                    className="absolute right-3 top-3 rounded-full bg-card/90 backdrop-blur transition-transform hover:scale-110"
                  >
                    <Heart className="fill-terracotta text-terracotta" />
                  </Button>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <Badge variant="quiet" className="self-start">
                    {o.categorie}
                  </Badge>
                  <h3 className="mt-3 font-display text-lg leading-snug text-forest-deep">
                    <Link to="/art/oeuvres/$slug" params={{ slug: o.slug }}>
                      {o.titre}
                    </Link>
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">{o.artiste?.nom}</p>
                  <p className="mt-4 font-display text-xl text-forest-deep">{formatFcfa(o.prix)}</p>
                  <Button asChild variant="outline" className="mt-4 w-full">
                    <Link to="/art/oeuvres/$slug" params={{ slug: o.slug }}>
                      Voir l'œuvre
                    </Link>
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      ) : (
        /* ═══ VUE LISTE ═══ */
        <div className="mt-2 space-y-3">
          {liste.map((o, i) => (
            <Reveal key={o.slug} delay={i * 40}>
              <article className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-accent/20">
                <Link
                  to="/art/oeuvres/$slug"
                  params={{ slug: o.slug }}
                  className="shrink-0 overflow-hidden rounded-lg"
                >
                  <img
                    src={o.image_url}
                    alt={o.titre}
                    loading="lazy"
                    className="media-warm size-16 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-lg text-forest-deep">
                      <Link to="/art/oeuvres/$slug" params={{ slug: o.slug }}>
                        {o.titre}
                      </Link>
                    </h3>
                    <Badge variant="quiet" className="shrink-0">
                      {o.categorie}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {o.artiste?.nom} · {o.region}
                  </p>
                </div>
                <p className="shrink-0 font-display text-xl text-forest-deep">{formatFcfa(o.prix)}</p>
                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/art/oeuvres/$slug" params={{ slug: o.slug }}>
                      Voir
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Retirer ${o.titre} des favoris`}
                    onClick={() => toggleFavori.mutate(o.id)}
                    className="text-muted-foreground hover:text-terracotta"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </ProfilShell>
  );
}
