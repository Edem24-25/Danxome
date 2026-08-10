import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Compass, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SiteShell } from "@/components/site/SiteShell";
import { ContentCard } from "@/components/site/ContentCard";
import { Reveal } from "@/components/site/Reveal";
import { Rule, SectionTitle } from "@/components/site/Bits";
import { BeninMap } from "@/components/site/BeninMap";
import { artistes, evenements, images, musees, sites } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dãhomè — Le patrimoine vivant du Bénin" },
      {
        name: "description",
        content:
          "Explorez les royaumes, musées, sites classés et artisans du Bénin : visites virtuelles 360°, carte interactive et agenda culturel.",
      },
      { property: "og:title", content: "Dãhomè — Le patrimoine vivant du Bénin" },
      {
        property: "og:description",
        content:
          "Visites virtuelles, carte interactive, galerie d'artisans et agenda culturel du Bénin.",
      },
    ],
  }),
  component: Accueil,
});

function Accueil() {
  return (
    <SiteShell>
      {/* ═══ HERO ═══ */}
      <section className="relative isolate flex min-h-[92vh] items-end overflow-hidden">
        <img
          src={images.heroAbomey}
          alt="Bas-reliefs des palais royaux d'Abomey au coucher du soleil"
          width={1920}
          height={1280}
          className="media-warm absolute inset-0 size-full object-cover"
        />
        {/* Overlay enrichi multi-couche */}
        <div className="absolute inset-0 hero-overlay" />
        <div
          className="pattern-fon absolute inset-0 opacity-[0.12] mix-blend-overlay"
          aria-hidden
        />
        <div className="absolute inset-0 texture-grain" aria-hidden />

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-32 pb-20 text-center sm:px-6 sm:pb-24 lg:px-8">
          <Reveal variant="up" delay={100}>
            <Badge variant="onDark" className="mx-auto animate-bounce-in">
              Patrimoine mondial · Bénin
            </Badge>
          </Reveal>

          <Reveal variant="up" delay={250}>
            <h1 className="mx-auto mt-8 max-w-4xl font-display text-5xl leading-[0.96] text-ivory sm:text-6xl lg:text-7xl">
              Le royaume du Dãhomè
              <br />
              <span className="text-gradient-gold">n'a jamais cessé de parler.</span>
            </h1>
          </Reveal>

          <Reveal variant="up" delay={400}>
            <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-ivory/75 sm:text-lg">
              Douze palais de terre rouge, quatre-vingts langues, des ateliers qui fondent encore le
              laiton. Entrez par la porte que vous voulez.
            </p>
          </Reveal>

          <Reveal variant="up" delay={550}>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-full border border-ivory/20 bg-ivory/10 p-2 backdrop-blur-xl sm:flex-row"
              role="search"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
                <Search className="size-4 shrink-0 text-accent" />
                <Input
                  placeholder="Un site, un royaume, un artisan, une fête…"
                  className="border-0 bg-transparent text-ivory shadow-none placeholder:text-ivory/50 focus-visible:ring-0"
                  aria-label="Rechercher sur Dãhomè"
                />
              </div>
              <Button variant="gold" size="lg" type="submit" className="rounded-full">
                Explorer
              </Button>
            </form>
          </Reveal>

          <Reveal variant="up" delay={700}>
            <div className="mx-auto mt-10 flex flex-wrap justify-center gap-x-10 gap-y-3 text-xs tracking-wider text-ivory/60 uppercase">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />4 sites UNESCO
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                62 musées & collections
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                340 artisans référencés
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CARTE INTERACTIVE ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <SectionTitle
            eyebrow="Carte interactive"
            title="Du littoral vodun aux plateaux baatonu"
            intro="Chaque épingle ouvre une fiche : histoire, horaires, hébergements, visite virtuelle quand elle existe."
            action={
              <Button asChild variant="outlineGold" className="rounded-full">
                <Link to="/tourisme/carte">
                  Carte plein écran <ArrowRight />
                </Link>
              </Button>
            }
          />
        </Reveal>
        <Reveal variant="up" delay={120} className="mt-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <BeninMap className="min-h-[420px]" />
            <div className="grid gap-4 sm:grid-cols-2">
              {sites.slice(0, 4).map((s) => (
                <ContentCard
                  key={s.slug}
                  to="/tourisme/sites/$slug"
                  params={{ slug: s.slug }}
                  image={s.image}
                  titre={s.nom}
                  meta={`${s.region} · ${s.type}`}
                  note={s.note}
                  ratio="carre"
                />
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <Rule className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" />

      {/* ═══ VISITES VIRTUELLES ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <SectionTitle
            eyebrow="Visites virtuelles 360°"
            title="Marchez dans les cours royales"
            intro="Panoramas haute résolution, hotspots documentés, narration en français, fon et anglais."
          />
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sites
            .filter((s) => s.virtuel)
            .concat(sites.filter((s) => s.virtuel))
            .slice(0, 6)
            .map((s, i) => (
              <Reveal key={s.slug + i} variant="up" delay={i * 100}>
                <Link
                  to="/visite/$slug"
                  params={{ slug: s.slug }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]"
                >
                  <img
                    src={s.image}
                    alt={s.nom}
                    loading="lazy"
                    className="media-warm size-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/20 to-transparent" />
                  <div className="absolute inset-0 pattern-dots opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                    <div>
                      <p className="eyebrow-gold">{s.region}</p>
                      <h3 className="mt-1 font-display text-2xl text-ivory">{s.nom}</h3>
                    </div>
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-gold transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                      <Play className="size-5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
        </div>
      </section>

      {/* ═══ ARTISTES ═══ */}
      <section className="mt-20 section-alt py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <SectionTitle
              eyebrow="Art & artisanat"
              title="Les mains qui tiennent la mémoire"
              intro="Achetez directement aux ateliers, ou soutenez un artisan par un don. 100 % du prix de vente revient au créateur."
              action={
                <Button asChild variant="cultural" className="rounded-full">
                  <Link to="/art">
                    Voir la galerie <ArrowRight />
                  </Link>
                </Button>
              }
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {artistes.map((a, i) => (
              <Reveal key={a.slug} variant="up" delay={i * 100}>
                <ContentCard
                  to="/art/artistes/$slug"
                  params={{ slug: a.slug }}
                  image={a.image}
                  titre={a.nom}
                  meta={`${a.metier} · ${a.ville}`}
                  resume={a.bio}
                  ratio="portrait"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ÉVÉNEMENTS ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <SectionTitle
            eyebrow="Calendrier culturel"
            title="L'année rituelle"
            action={
              <Button asChild variant="outlineGold" className="rounded-full">
                <Link to="/evenements">
                  <CalendarDays /> Tout le calendrier
                </Link>
              </Button>
            }
          />
        </Reveal>
        <ol className="mt-12 border-l-2 border-border/60">
          {evenements.map((e, i) => (
            <Reveal key={e.slug} variant="left" delay={i * 80}>
              <li className="relative grid gap-4 py-7 pl-10 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                <span className="absolute top-1/2 -left-[9px] size-4 -translate-y-1/2 rounded-full border-[3px] border-background bg-accent shadow-gold" />
                <div className="font-display text-2xl text-terracotta">
                  {e.jour}
                  <span className="ml-1 text-xs tracking-widest">{e.mois}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-xl text-forest-deep">{e.titre}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {e.lieu} · {e.categorie} · {e.resume}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="rounded-full">
                  <Link to="/evenements/$slug" params={{ slug: e.slug }}>
                    Détails <ArrowRight />
                  </Link>
                </Button>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ═══ MUSÉES PARALLAX ═══ */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-fixed bg-center"
          style={{ backgroundImage: `url(${images.museum})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-forest-darker/85" />
        <div className="absolute inset-0 texture-grain" aria-hidden />
        <div className="absolute inset-0 pattern-fon opacity-10" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <SectionTitle
              dark
              eyebrow="Musées & collections"
              title="Les objets sont revenus. Allons les voir."
              intro="Vingt-six trésors royaux restitués par la France en 2021, exposés entre Cotonou, Ouidah et Abomey."
            />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {musees.map((m, i) => (
              <Reveal key={m.slug} variant="up" delay={i * 110}>
                <Link
                  to="/culture/musees/$slug"
                  params={{ slug: m.slug }}
                  className="group block rounded-xl border border-ivory/10 bg-ivory/5 p-6 backdrop-blur-sm transition-all duration-400 hover:border-accent/40 hover:bg-ivory/8 hover:shadow-gold"
                >
                  <p className="eyebrow-gold">{m.ville}</p>
                  <h3 className="mt-2 font-display text-2xl text-ivory">{m.nom}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory/60">{m.resume}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                    Infos pratiques{" "}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DÉCOUVRIR LA CULTURE ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal variant="scale">
          <div className="ia-surface relative overflow-hidden rounded-2xl px-6 py-16 text-center sm:px-16">
            <div className="pattern-fon absolute inset-0 opacity-15" aria-hidden />
            <div className="absolute inset-0 texture-grain" aria-hidden />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl text-ivory sm:text-4xl">
                Explorez le patrimoine béninois
              </h2>
              <p className="mt-4 text-ivory/70">
                Royaumes, musées, visites virtuelles 360° et artisanat : plongez dans la richesse
                culturelle du Bénin.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button asChild variant="gold" size="lg" className="rounded-full">
                  <Link to="/culture">
                    <Compass /> Parcourir la culture
                  </Link>
                </Button>
                <Button asChild variant="onDark" size="lg" className="rounded-full">
                  <Link to="/tourisme">Découvrir les sites</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
