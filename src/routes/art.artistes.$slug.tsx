import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, MapPin, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs, Rule, SectionTitle, StatCard } from "@/components/site/Bits";
import { ContentCard } from "@/components/site/ContentCard";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { artistes, formatFcfa, oeuvres } from "@/lib/data";

export const Route = createFileRoute("/art/artistes/$slug")({
  loader: ({ params }) => {
    const artiste = artistes.find((a) => a.slug === params.slug);
    if (!artiste) throw notFound();
    return { artiste };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Artiste introuvable — Dãhomè" }, { name: "robots", content: "noindex" }],
      };
    }
    const { artiste } = loaderData;
    return {
      meta: [
        { title: `${artiste.nom}, ${artiste.metier} — Dãhomè` },
        { name: "description", content: artiste.bio },
        { property: "og:title", content: `${artiste.nom} — ${artiste.metier} | Dãhomè` },
        { property: "og:description", content: artiste.bio },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArtisteDetail,
});

function ArtisteDetail() {
  const { artiste } = Route.useLoaderData();
  const siennes = oeuvres.filter((o) => o.artisteSlug === artiste.slug);

  return (
    <SiteShell>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <Breadcrumbs items={[{ label: "Art & artisanat", to: "/art" }, { label: artiste.nom }]} />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-lg border border-border">
              <img
                src={artiste.image}
                alt={artiste.nom}
                className="media-warm aspect-square w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <Badge variant="gold">{artiste.metier}</Badge>
              <h1 className="mt-4 font-display text-4xl text-forest-deep sm:text-5xl">
                {artiste.nom}
              </h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4 text-terracotta" /> {artiste.ville}, Bénin
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/85">
                {artiste.bio}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="gold">
                  <Link to="/art/boutique">Voir ses œuvres disponibles</Link>
                </Button>
                <Button variant="outline">
                  <Heart /> Soutenir l'atelier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <StatCard
            label="Œuvres publiées"
            value={String(siennes.length)}
            icon={<Sparkles className="size-4" />}
          />
          <StatCard label="Années de pratique" value="18" delta="Atelier familial depuis 1974" />
          <StatCard
            label="Pièce la plus rare"
            value={siennes[0] ? formatFcfa(siennes[0].prix) : "—"}
          />
        </div>

        <Rule />

        <SectionTitle eyebrow="Atelier" title="Œuvres de l'artiste" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {siennes.map((o, i) => (
            <Reveal key={o.slug} delay={i * 80}>
              <ContentCard
                to="/art/oeuvres/$slug"
                params={{ slug: o.slug }}
                image={o.image}
                titre={o.titre}
                meta={o.categorie}
                resume={o.description}
                ratio="portrait"
                footer={formatFcfa(o.prix)}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
