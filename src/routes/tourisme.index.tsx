import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Map, SlidersHorizontal, UtensilsCrossed, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { EmptyState, PageHead, Rule, SectionTitle } from "@/components/site/Bits";
import { ContentCard } from "@/components/site/ContentCard";
import { BeninMap } from "@/components/site/BeninMap";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSites } from "@/hooks/use-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tourisme/")({
  head: () => ({
    meta: [
      { title: "Sites touristiques du Bénin — DanXomè" },
      {
        name: "description",
        content:
          "Palais d'Abomey, Ganvié, Pendjari, Route des Esclaves : explorez les sites incontournables du Bénin, filtrez par région et réservez votre visite.",
      },
      { property: "og:title", content: "Sites touristiques du Bénin — DanXomè" },
      {
        property: "og:description",
        content: "Explorez les sites incontournables du Bénin, région par région.",
      },
    ],
  }),
  component: Tourisme,
});

function Tourisme() {
  const { data: sites = [], isLoading } = useSites();
  const [q, setQ] = useState("");
  const [type, setType] = useState("Tous");
  const [region, setRegion] = useState("Toutes");
  const [virtuelOnly, setVirtuelOnly] = useState(false);

  const types = useMemo(() => ["Tous", ...Array.from(new Set(sites.map((s) => s.type)))], [sites]);
  const regions = useMemo(
    () => ["Toutes", ...Array.from(new Set(sites.map((s) => s.region)))],
    [sites],
  );

  const resultats = useMemo(
    () =>
      sites.filter(
        (s) =>
          (type === "Tous" || s.type === type) &&
          (region === "Toutes" || s.region === region) &&
          (!virtuelOnly || s.virtuel) &&
          (q.trim() === "" ||
            `${s.nom} ${s.region} ${s.resume}`.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [q, type, region, virtuelOnly, sites],
  );

  if (isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="mt-3 h-4 w-96" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
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
        eyebrow="Tourisme"
        title="Douze régions, mille itinéraires"
        intro="Du lac Nokoué aux collines de l'Atacora, chaque site est documenté, noté par les voyageurs et — pour beaucoup — visitable en 360° avant le départ."
        crumbs={[{ label: "Tourisme" }]}
        aside={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="cultural" className="rounded-full">
              <Link to="/tourisme/gastronomie">
                <UtensilsCrossed /> Gastronomie
              </Link>
            </Button>
            <Button asChild variant="cultural" className="rounded-full">
              <Link to="/tourisme/carte">
                <Map /> Carte interactive
              </Link>
            </Button>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* ═══ FILTRES ═══ */}
        <Reveal variant="up">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              <SlidersHorizontal className="size-3.5" /> Filtres
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un site, une ville, un thème…"
                aria-label="Rechercher un site"
                className="rounded-full"
              />
              <button
                onClick={() => setVirtuelOnly((v) => !v)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                  virtuelOnly
                    ? "border-forest bg-forest text-primary-foreground shadow-relief"
                    : "border-border text-foreground/70 hover:border-accent/50 hover:shadow-sm",
                )}
              >
                <Video className="size-4" /> Visite virtuelle disponible
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FilterRow label="Type" options={types} value={type} onChange={setType} />
              <FilterRow label="Région" options={regions} value={region} onChange={setRegion} />
            </div>
          </div>
        </Reveal>

        {/* ═══ RÉSULTATS ═══ */}
        <Reveal variant="up" delay={100}>
          <div className="mt-10 flex items-baseline justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-display text-2xl text-forest-deep">{resultats.length}</span>{" "}
              site
              {resultats.length > 1 ? "s" : ""} correspondant à votre recherche
            </p>
          </div>
        </Reveal>

        {resultats.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={<Compass className="size-5" />}
              title="Aucun site pour ces critères"
              description="Élargissez la région ou le type de site pour découvrir d'autres destinations."
              action={
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setQ("");
                    setType("Tous");
                    setRegion("Toutes");
                    setVirtuelOnly(false);
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resultats.map((s, i) => (
              <Reveal key={s.slug} variant="up" delay={i * 70}>
                <ContentCard
                  to="/tourisme/sites/$slug"
                  params={{ slug: s.slug }}
                  image={s.image_url}
                  titre={s.nom}
                  meta={`${s.region} · ${s.type}`}
                  resume={s.resume}
                  {...(s.virtuel ? { tag: "Visite 360°" } : {})}
                  note={s.note}
                />
              </Reveal>
            ))}
          </div>
        )}

        <Rule />

        {/* ═══ CARTE ═══ */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <Reveal variant="left">
            <div>
              <SectionTitle
                eyebrow="Repères"
                title="Situer avant de partir"
                intro="Les sites sont répartis du littoral atlantique jusqu'aux savanes du nord. Ouvrez la carte plein écran pour composer votre itinéraire."
                action={
                  <Button asChild variant="gold" className="rounded-full">
                    <Link to="/tourisme/carte">
                      <Map /> Ouvrir la carte
                    </Link>
                  </Button>
                }
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {sites.map((s) => (
                  <Link
                    key={s.slug}
                    to="/tourisme/sites/$slug"
                    params={{ slug: s.slug }}
                    className="group flex items-center justify-between gap-3 rounded-full border border-border bg-card px-4 py-3 text-sm transition-all duration-300 hover:border-accent/40 hover:shadow-sm"
                  >
                    <span className="min-w-0 truncate font-semibold text-forest-deep transition-colors group-hover:text-forest">
                      {s.nom}
                    </span>
                    <Badge variant="quiet">{s.region}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <BeninMap sites={sites} className="aspect-[4/5] w-full" />
          </Reveal>
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
