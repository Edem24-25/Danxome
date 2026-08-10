import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers, MapPin, Star, Video } from "lucide-react";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs } from "@/components/site/Bits";
import { BeninMap } from "@/components/site/BeninMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sites } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tourisme/carte")({
  head: () => ({
    meta: [
      { title: "Carte interactive du Bénin — Dãhomè" },
      {
        name: "description",
        content:
          "Localisez les sites patrimoniaux, villages lacustres et parcs nationaux du Bénin sur une carte interactive et composez votre itinéraire.",
      },
      { property: "og:title", content: "Carte interactive du Bénin — Dãhomè" },
      {
        property: "og:description",
        content: "Localisez les sites du Bénin et composez votre itinéraire.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Carte,
});

const couches = Array.from(new Set(sites.map((s) => s.type)));

function Carte() {
  const [actifs, setActifs] = useState<string[]>(couches);
  const visibles = sites.filter((s) => actifs.includes(s.type));

  const toggle = (c: string) =>
    setActifs((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  return (
    <SiteShell>
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-8 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: "Tourisme", to: "/tourisme" }, { label: "Carte" }]} />
          <div className="mt-6 grid items-end gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <p className="eyebrow">Cartographie</p>
              <h1 className="mt-3 font-display text-4xl text-forest-deep sm:text-5xl">
                Le Bénin, du littoral à l'Atacora
              </h1>
            </div>
            <Button asChild variant="outline">
              <Link to="/tourisme">Vue en liste</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
          <div className="order-2 lg:order-1">
            <BeninMap actifs={actifs} className="min-h-[520px] w-full lg:min-h-[680px]" />
            <p className="mt-3 text-xs text-muted-foreground">
              Survolez un repère pour afficher le nom du site, cliquez pour ouvrir sa fiche.
            </p>
          </div>

          <aside className="order-1 space-y-5 lg:order-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                <Layers className="size-3.5" /> Couches
              </div>
              <div className="mt-4 space-y-2">
                {couches.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggle(c)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-md border px-3.5 py-2.5 text-left text-sm font-semibold transition-colors",
                      actifs.includes(c)
                        ? "border-forest bg-forest/10 text-forest-deep"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {c}
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        actifs.includes(c) ? "bg-accent" : "bg-border",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card">
              <p className="border-b border-border px-5 py-3.5 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                {visibles.length} site{visibles.length > 1 ? "s" : ""} affiché
                {visibles.length > 1 ? "s" : ""}
              </p>
              <ul className="divide-y divide-border">
                {visibles.map((s) => (
                  <li key={s.slug}>
                    <Link
                      to="/tourisme/sites/$slug"
                      params={{ slug: s.slug }}
                      className="flex gap-3 p-4 transition-colors hover:bg-secondary/60"
                    >
                      <img
                        src={s.image}
                        alt={s.nom}
                        loading="lazy"
                        className="media-warm size-14 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-forest-deep">{s.nom}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" /> {s.region}
                          <Star className="ml-1 size-3 fill-accent text-accent" />
                          {s.note.toFixed(1)}
                        </p>
                        <p className="mt-1">
                          {s.virtuel && (
                            <Badge variant="quiet" className="gap-1">
                              <Video className="size-3" /> 360°
                            </Badge>
                          )}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
