import { createFileRoute, Link } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead } from "@/components/site/Bits";
import { ContentCard } from "@/components/site/ContentCard";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlats } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tourisme/gastronomie/")({
  head: () => ({
    meta: [
      { title: "Gastronomie béninoise — DanXomè" },
      {
        name: "description",
        content:
          "Découvrez les saveurs du Bénin : pâte rouge, ablo, wagashi, akassa et autres spécialités culinaires des douze régions.",
      },
      { property: "og:title", content: "Gastronomie béninoise — DanXomè" },
      {
        property: "og:description",
        content: "Les plats emblématiques du Bénin, région par région.",
      },
    ],
  }),
  component: GastronomieIndex,
});

function GastronomieIndex() {
  const { data: plats = [] } = usePlats();
  const [q, setQ] = useState("");
  const [categorie, setCategorie] = useState("Tous");
  const [region, setRegion] = useState("Toutes");

  const categories = useMemo(
    () => ["Tous", ...Array.from(new Set(plats.map((p) => p.categorie)))],
    [plats],
  );
  const regions = useMemo(
    () => ["Toutes", ...Array.from(new Set(plats.map((p) => p.region)))],
    [plats],
  );

  const resultats = useMemo(
    () =>
      plats.filter(
        (p) =>
          (categorie === "Tous" || p.categorie === categorie) &&
          (region === "Toutes" || p.region === region) &&
          (q.trim() === "" ||
            `${p.nom} ${p.region} ${p.resume}`.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [q, categorie, region, plats],
  );

  return (
    <SiteShell>
      <PageHead
        eyebrow="Tourisme"
        title="Goûter au Bénin"
        intro="Du nord au sud, la gastronomie béninoise raconte les terroirs, les migrations et les savoir-faire culinaires. Chaque plat est une invitation au voyage."
        crumbs={[{ label: "Tourisme", to: "/tourisme" }, { label: "Gastronomie" }]}
        aside={
          <Button asChild variant="cultural" className="rounded-full">
            <Link to="/tourisme">
              <UtensilsCrossed /> Retour aux sites
            </Link>
          </Button>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Reveal variant="up">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un plat, une région…"
                aria-label="Rechercher un plat"
                className="rounded-full"
              />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FilterRow
                label="Catégorie"
                options={categories}
                value={categorie}
                onChange={setCategorie}
              />
              <FilterRow label="Région" options={regions} value={region} onChange={setRegion} />
            </div>
          </div>
        </Reveal>

        <Reveal variant="up" delay={100}>
          <div className="mt-10 flex items-baseline justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-display text-2xl text-forest-deep">{resultats.length}</span>{" "}
              plat{resultats.length > 1 ? "s" : ""} correspondant à votre recherche
            </p>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resultats.map((p, i) => (
            <Reveal key={p.slug} variant="up" delay={i * 70}>
              <ContentCard
                to="/tourisme/gastronomie/$slug"
                params={{ slug: p.slug }}
                image={p.image_url}
                titre={p.nom}
                meta={`${p.region} · ${p.categorie}`}
                resume={p.resume}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300",
              value === o
                ? "border-accent bg-accent text-accent-foreground shadow-gold"
                : "border-border text-foreground/70 hover:border-accent/50 hover:shadow-sm",
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
