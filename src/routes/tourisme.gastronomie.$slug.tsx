import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  MapPin,
  ArrowLeft,
  UtensilsCrossed,
  Heart,
  Share2,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs, Rule, SectionTitle } from "@/components/site/Bits";
import { ContentCard } from "@/components/site/ContentCard";
import { Reveal } from "@/components/site/Reveal";
import { AvisSection } from "@/components/site/AvisSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { plats } from "@/lib/data";

const FAV_KEY = "dahome:favoris";

export const Route = createFileRoute("/tourisme/gastronomie/$slug")({
  loader: ({ params }) => {
    const plat = plats.find((p) => p.slug === params.slug);
    if (!plat) throw notFound();
    return { plat };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Plat introuvable — DanXomè" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { plat } = loaderData;
    return {
      meta: [
        { title: `${plat.nom} — Gastronomie béninoise | DanXomè` },
        { name: "description", content: plat.resume },
        { property: "og:title", content: `${plat.nom} — DanXomè` },
        { property: "og:description", content: plat.resume },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: PlatDetail,
});

function PlatDetail() {
  const { plat } = Route.useLoaderData();
  const autres = plats.filter((p) => p.slug !== plat.slug).slice(0, 3);

  const [favoris, setFavoris] = useState<string[]>([]);
  const isFav = favoris.includes(plat.slug);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAV_KEY);
      if (stored) setFavoris(JSON.parse(stored));
    } catch {
      /* localStorage indisponible */
    }
  }, []);

  const toggleFav = useCallback(() => {
    setFavoris((prev) => {
      const next = isFav
        ? prev.filter((s) => s !== plat.slug)
        : [...prev, plat.slug];
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* localStorage indisponible */
      }
      return next;
    });
  }, [isFav, plat.slug]);

  const partager = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `${plat.nom} — DanXomè`, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  }, [plat.nom]);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src={plat.image}
            alt={plat.nom}
            className="media-warm size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/70 to-forest-deep/30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 sm:pt-10 sm:pb-20 lg:px-8">
          <Breadcrumbs
            dark
            items={[
              { label: "Tourisme", to: "/tourisme" },
              { label: "Gastronomie", to: "/tourisme/gastronomie" },
              { label: plat.nom },
            ]}
          />
          <div className="mt-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">{plat.categorie}</Badge>
              <Badge variant="quiet">{plat.region}</Badge>
            </div>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] text-ivory sm:text-5xl lg:text-6xl">
              {plat.nom}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ivory/80">
              {plat.resume}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-ivory/80">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-accent" /> {plat.origine}
              </span>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="onDark"
                size="sm"
                className="rounded-full"
                onClick={toggleFav}
              >
                <Heart
                  className={cn(
                    "size-4",
                    isFav && "fill-rose-400 text-rose-400",
                  )}
                />{" "}
                {isFav ? "Favori" : "Ajouter aux favoris"}
              </Button>
              <Button
                variant="onDark"
                size="sm"
                className="rounded-full"
                onClick={partager}
              >
                <Share2 className="size-4" /> Partager
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <article className="min-w-0 space-y-12">
            {/* Ingrédients */}
            <div>
              <p className="eyebrow">Ingrédients</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {plat.ingredients.map((ing) => (
                  <Badge key={ing} variant="quiet">
                    {ing}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Préparation */}
            <div>
              <p className="eyebrow">Préparation</p>
              <p className="mt-5 text-base leading-relaxed text-foreground/85">
                {plat.preparation}
              </p>
            </div>

            {/* Où goûter */}
            <div>
              <p className="eyebrow">Où goûter</p>
              <p className="mt-5 text-base leading-relaxed text-foreground/85">
                {plat.ou}
              </p>
            </div>

            {/* Histoire du plat */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 text-forest-deep">
                <BookOpen className="size-5" />
                <p className="eyebrow !text-forest-deep !tracking-[0.16em]">
                  Histoire du plat
                </p>
              </div>
              <p className="mt-4 text-base leading-relaxed text-foreground/85">
                {plat.histoire}
              </p>
            </div>

            {/* Curiosité */}
            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="size-5" />
                <p className="eyebrow !text-accent !tracking-[0.16em]">
                  Le saviez-vous ?
                </p>
              </div>
              <p className="mt-4 text-base leading-relaxed text-foreground/85">
                {plat.curiosite}
              </p>
            </div>

            {/* Avis */}
            <AvisSection platSlug={plat.slug} />
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-lg bg-forest-deep p-6 text-ivory">
              <div className="pattern-fon absolute inset-0 opacity-20" aria-hidden />
              <div className="relative">
                <p className="eyebrow text-accent">Découvrir plus</p>
                <h3 className="mt-3 font-display text-2xl">
                  Autres spécialités
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/75">
                  Explorez d'autres plats de la gastronomie béninoise.
                </p>
                <Button
                  asChild
                  variant="onDark"
                  className="mt-5 w-full"
                >
                  <Link to="/tourisme/gastronomie">
                    <UtensilsCrossed className="mr-1 size-4" /> Tous les plats
                  </Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>

        <Rule />

        <SectionTitle
          eyebrow="À découvrir"
          title="Autres spécialités"
          action={
            <Button asChild variant="outline">
              <Link to="/tourisme/gastronomie">Tous les plats</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {autres.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <ContentCard
                to="/tourisme/gastronomie/$slug"
                params={{ slug: p.slug }}
                image={p.image}
                titre={p.nom}
                meta={`${p.region} · ${p.categorie}`}
                resume={p.resume}
              />
            </Reveal>
          ))}
        </div>

        <Rule />

        <div className="flex justify-center">
          <Button asChild variant="ghost">
            <Link to="/tourisme">
              <ArrowLeft className="mr-1 size-4" /> Retour aux sites
              touristiques
            </Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
