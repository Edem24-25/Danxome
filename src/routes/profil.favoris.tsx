import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
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

function ProfilFavoris() {
  const { data: favorisData } = useFavoris();
  const toggleFavori = useToggleFavori();
  const { data: oeuvres = [], isLoading: oeuvresLoading } = useOeuvres();
  const favorisIds = (favorisData ?? []).map(f => f.oeuvre_id);
  const liste = oeuvres.filter((o) => favorisIds.includes(o.id));

  return (
    <ProfilShell
      title="Mes favoris"
      crumbs={[{ label: "Mon profil", to: "/profil" }, { label: "Favoris" }]}
    >
      <SectionTitle
        eyebrow="Œuvres"
        title={`${liste.length} œuvre${liste.length > 1 ? "s" : ""} en favori`}
      />
      {oeuvresLoading ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-border">
              <Skeleton className="aspect-[4/5] w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : liste.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-5" />}
          title="Aucun favori pour l'instant"
          description="Explorez la boutique et touchez le cœur pour garder vos coups de cœur à portée de main."
          action={
            <Button asChild variant="gold">
              <Link to="/art/boutique">Découvrir la boutique</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {liste.map((o, i) => (
            <Reveal key={o.slug} delay={i * 60}>
              <article className="hover-lift flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
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
                    className="absolute right-3 top-3 rounded-full bg-card/90 backdrop-blur"
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
      )}
    </ProfilShell>
  );
}
