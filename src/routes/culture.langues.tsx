import { createFileRoute } from "@tanstack/react-router";
import { Pause, Play, Volume2 } from "lucide-react";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead, Rule } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { langues } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/culture/langues")({
  head: () => ({
    meta: [
      { title: "Langues nationales du Bénin — DanXomè" },
      {
        name: "description",
        content:
          "Fon, yoruba, bariba, dendi, mina, ditammari : cartes interactives et extraits audio des langues du Bénin.",
      },
      { property: "og:title", content: "Langues nationales du Bénin — DanXomè" },
      { property: "og:description", content: "Cartes et extraits audio des langues béninoises." },
    ],
  }),
  component: Langues,
});

function Langues() {
  const [joue, setJoue] = useState<string | null>(null);

  return (
    <SiteShell>
      <PageHead
        eyebrow="Langues"
        title="Cinquante-cinq langues, un seul pays"
        intro="Chaque carte donne la prononciation d'une salutation, l'aire de diffusion et une archive sonore enregistrée avec les locuteurs."
        crumbs={[{ label: "Culture", to: "/culture" }, { label: "Langues nationales" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {langues.map((l, i) => {
            const actif = joue === l.nom;
            return (
              <Reveal key={l.nom} delay={i * 70}>
                <article
                  className={cn(
                    "group relative flex h-full flex-col justify-between overflow-hidden rounded-lg border p-6 transition-colors",
                    actif ? "border-accent bg-forest-deep" : "border-border bg-card",
                  )}
                >
                  <div className="pattern-fon absolute inset-0 opacity-25" aria-hidden />
                  <div className="relative">
                    <Badge variant={actif ? "onDark" : "quiet"}>{l.region}</Badge>
                    <h2
                      className={cn(
                        "mt-4 font-display text-3xl",
                        actif ? "text-ivory" : "text-forest-deep",
                      )}
                    >
                      {l.nom}
                    </h2>
                    <p
                      className={cn(
                        "mt-1 text-xs",
                        actif ? "text-ivory/60" : "text-muted-foreground",
                      )}
                    >
                      {l.locuteurs} locuteurs
                    </p>
                    <p
                      className={cn(
                        "mt-6 font-display text-2xl",
                        actif ? "text-accent" : "text-terracotta",
                      )}
                    >
                      {l.salut}
                    </p>
                    <p className={cn("text-sm", actif ? "text-ivory/70" : "text-muted-foreground")}>
                      « {l.sens} »
                    </p>
                  </div>

                  <button
                    onClick={() => setJoue(actif ? null : l.nom)}
                    className={cn(
                      "relative mt-7 flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors",
                      actif
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-forest-deep hover:bg-accent hover:text-accent-foreground",
                    )}
                    aria-pressed={actif}
                  >
                    {actif ? <Pause className="size-4" /> : <Play className="size-4" />}
                    {actif ? "Lecture de l'extrait…" : "Écouter la salutation"}
                    <Volume2 className="ml-auto size-4 opacity-60" />
                  </button>
                  {actif && (
                    <div className="relative mt-3 flex h-6 items-end gap-0.5">
                      {Array.from({ length: 42 }).map((_, k) => (
                        <span
                          key={k}
                          className="w-full animate-pulse rounded-sm bg-accent/70"
                          style={{
                            height: `${20 + Math.abs(Math.sin(k * 1.7)) * 80}%`,
                            animationDelay: `${k * 40}ms`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>

        <Rule />

        <div className="grid gap-8 rounded-lg border border-border bg-secondary/50 p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <p className="eyebrow">Archive vivante</p>
            <h2 className="mt-3 font-display text-3xl text-forest-deep">
              Contribuez à l'atlas sonore
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Étudiants, enseignants et membres de la diaspora enregistrent proverbes, comptines et
              récits. Chaque contribution est validée par un linguiste partenaire avant publication.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-6 self-center">
            <div>
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">Archives</dt>
              <dd className="font-display text-4xl text-forest-deep">1 240</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">Langues</dt>
              <dd className="font-display text-4xl text-forest-deep">55</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">
                Contributeurs
              </dt>
              <dd className="font-display text-4xl text-forest-deep">318</dd>
            </div>
            <div>
              <dt className="text-xs tracking-widest text-muted-foreground uppercase">Heures</dt>
              <dd className="font-display text-4xl text-forest-deep">96</dd>
            </div>
          </dl>
        </div>
      </section>
    </SiteShell>
  );
}
