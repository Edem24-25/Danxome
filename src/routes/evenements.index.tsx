import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead, Rule, SectionTitle, EmptyState } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { evenements } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/evenements/")({
  head: () => ({
    meta: [
      { title: "Agenda culturel du Bénin — DanXomè" },
      {
        name: "description",
        content:
          "Festivals, fêtes royales et rendez-vous d'art contemporain : le calendrier culturel béninois mois par mois.",
      },
      { property: "og:title", content: "Agenda culturel du Bénin — DanXomè" },
      {
        property: "og:description",
        content: "Vodun Days, Gaani, Biennale de Cotonou et tous les rendez-vous du patrimoine.",
      },
    ],
  }),
  component: Evenements,
});

const categories = ["Toutes", ...Array.from(new Set(evenements.map((e) => e.categorie)))];

function Evenements() {
  const [cat, setCat] = useState("Toutes");
  const liste = evenements.filter((e) => cat === "Toutes" || e.categorie === cat);
  const une = evenements[0];

  return (
    <SiteShell>
      <PageHead
        eyebrow="Événements"
        title="Le Bénin se célèbre toute l'année"
        intro="Des cultes vodun de janvier aux projections de décembre, chaque saison porte ses rituels, ses tambours et ses expositions."
        crumbs={[{ label: "Événements" }]}
        aside={
          <div className="rounded-xl border border-border bg-card p-5 text-sm shadow-sm">
            <p className="eyebrow">Saison 2026</p>
            <p className="mt-2 font-display text-4xl text-forest-deep">
              {evenements.length} temps forts
            </p>
            <p className="mt-1 text-muted-foreground">répartis sur 6 départements</p>
          </div>
        }
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* ═══ ÉVÉNEMENT À LA UNE ═══ */}
        {une && (
          <Reveal variant="up">
            <article className="relative overflow-hidden rounded-2xl border border-border">
              <img
                src={une.image}
                alt={`${une.titre} à ${une.lieu}`}
                className="media-warm h-[22rem] w-full object-cover sm:h-[26rem]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-darker via-forest-deep/60 to-transparent" />
              <div className="absolute inset-0 texture-grain" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                <Badge variant="onDark" className="animate-bounce-in">
                  À la une · {une.categorie}
                </Badge>
                <h2 className="mt-4 font-display text-3xl text-ivory sm:text-5xl">{une.titre}</h2>
                <p className="mt-3 max-w-xl text-sm text-ivory/70">{une.resume}</p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-ivory/80">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-accent" /> {une.date}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-accent" /> {une.lieu}
                  </span>
                  <Button asChild variant="gold" size="sm" className="rounded-full">
                    <Link to="/evenements/$slug" params={{ slug: une.slug }}>
                      Voir le programme
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          </Reveal>
        )}

        <Rule />

        {/* ═══ CALENDRIER ═══ */}
        <Reveal variant="up">
          <SectionTitle
            eyebrow="Calendrier"
            title="Tous les rendez-vous"
            intro="Filtrez par nature d'événement pour préparer votre voyage."
          />
        </Reveal>

        <Reveal variant="up" delay={80}>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300",
                  cat === c
                    ? "border-forest-deep bg-forest-deep text-ivory shadow-relief"
                    : "border-border bg-card text-foreground/70 hover:border-accent/50 hover:shadow-sm",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Reveal>

        {/* ═══ LISTE ═══ */}
        <div className="mt-8">
          {liste.length === 0 ? (
            <EmptyState
              title="Aucun événement"
              description="Aucun rendez-vous ne correspond à ce filtre pour la saison en cours."
              icon={<CalendarDays className="size-5" />}
            />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {liste.map((e, i) => (
                <li key={e.slug}>
                  <Reveal variant="left" delay={i * 60}>
                    <Link
                      to="/evenements/$slug"
                      params={{ slug: e.slug }}
                      className="group grid items-center gap-5 p-5 transition-all duration-300 hover:bg-secondary/40 sm:grid-cols-[5rem_8rem_minmax(0,1fr)_auto] sm:p-6"
                    >
                      <div className="flex size-20 flex-col items-center justify-center rounded-xl bg-forest-deep text-ivory shadow-relief transition-transform duration-300 group-hover:scale-105">
                        <span className="font-display text-3xl leading-none">{e.jour}</span>
                        <span className="mt-1 text-[10px] tracking-[0.2em]">{e.mois}</span>
                      </div>
                      <img
                        src={e.image}
                        alt={e.titre}
                        loading="lazy"
                        className="hidden h-20 w-32 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105 sm:block"
                      />
                      <div className="min-w-0">
                        <Badge variant="quiet">{e.categorie}</Badge>
                        <h3 className="mt-2 font-display text-2xl text-forest-deep">{e.titre}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {e.resume}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {e.date} · {e.lieu}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-terracotta transition-all group-hover:text-terracotta-deep group-hover:underline">
                        Détails
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
