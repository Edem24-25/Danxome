import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Crown, Languages, Landmark, ScrollText, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead, Rule, SectionTitle } from "@/components/site/Bits";
import { ContentCard } from "@/components/site/ContentCard";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { images, musees, royaumes } from "@/lib/data";

export const Route = createFileRoute("/culture/")({
  head: () => ({
    meta: [
      { title: "Culture & patrimoine du Bénin — Dãhomè" },
      {
        name: "description",
        content:
          "Royaumes, traditions, musées, histoire et langues nationales du Bénin, en grille éditoriale.",
      },
      { property: "og:title", content: "Culture & patrimoine du Bénin — Dãhomè" },
      {
        property: "og:description",
        content: "Royaumes, traditions, musées, histoire et langues du Bénin.",
      },
    ],
  }),
  component: Culture,
});

const piliers = [
  {
    icon: Crown,
    titre: "Royaumes",
    texte: "Abomey, Hogbonu, Nikki, Savalou : douze dynasties et leurs institutions.",
    to: "/culture/royaumes/abomey",
  },
  {
    icon: Sparkles,
    titre: "Traditions",
    texte: "Vodun, zangbéto, gèlèdé, tam-tams parleurs et rites d'initiation.",
    to: "/culture/langues",
  },
  {
    icon: Landmark,
    titre: "Musées",
    texte: "Collections royales, art contemporain et mémoire afro-brésilienne.",
    to: "/culture/musees/musee-histoire-abomey",
  },
  {
    icon: ScrollText,
    titre: "Histoire",
    texte: "Du Dãhomè précolonial à la République : cinq siècles en récits longs.",
    to: "/culture/royaumes/abomey",
  },
  {
    icon: Languages,
    titre: "Langues",
    texte: "Cinquante-cinq langues vivantes, six grandes familles, des archives sonores.",
    to: "/culture/langues",
  },
];

function Culture() {
  return (
    <SiteShell>
      <PageHead
        eyebrow="Culture"
        title="Cinq portes d'entrée dans la mémoire béninoise"
        intro="Nous publions des dossiers longs, documentés avec les conservateurs et les familles royales. Pas de fiches encyclopédiques anonymes."
        crumbs={[{ label: "Culture" }]}
        aside={
          <Button asChild variant="cultural" className="rounded-full">
            <Link to="/tourisme">Découvrir les sites</Link>
          </Button>
        }
      />

      {/* ═══ PILIERS ═══ */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {piliers.map((p, i) => (
            <Reveal
              key={p.titre}
              variant="up"
              delay={i * 80}
              className={i === 0 ? "lg:col-span-2" : ""}
            >
              <Link
                to={p.to}
                className="group flex h-full flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-7 transition-all duration-400 hover:-translate-y-1 hover:shadow-cultural hover:border-accent/30"
              >
                <div>
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <p.icon className="size-5" />
                  </div>
                  <h2 className="mt-5 font-display text-2xl text-forest-deep">{p.titre}</h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {p.texte}
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-forest transition-all group-hover:text-forest-light group-hover:gap-3">
                  Découvrir
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Rule className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" />

      {/* ═══ ROYAUMES ═══ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal variant="up">
          <SectionTitle eyebrow="Royaumes" title="Les dynasties et leurs territoires" />
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {royaumes.map((r, i) => (
            <Reveal key={r.slug} variant="up" delay={i * 90}>
              <ContentCard
                to="/culture/royaumes/$slug"
                params={{ slug: r.slug }}
                image={r.image}
                titre={r.nom}
                meta={r.periode}
                resume={r.resume}
                ratio="paysage"
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ MUSÉES ═══ */}
      <section className="mt-20 section-alt py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal variant="up">
            <SectionTitle
              eyebrow="Musées"
              title="Où voir les collections"
              action={
                <Button asChild variant="outlineGold" className="rounded-full">
                  <Link to="/culture/langues">Langues nationales</Link>
                </Button>
              }
            />
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {musees.map((m, i) => (
              <Reveal key={m.slug} variant="up" delay={i * 90}>
                <ContentCard
                  to="/culture/musees/$slug"
                  params={{ slug: m.slug }}
                  image={m.image}
                  titre={m.nom}
                  meta={m.ville}
                  resume={m.resume}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DOSSIER DU MOIS ═══ */}
      <section className="relative isolate mt-20 overflow-hidden">
        <img
          src={images.museum}
          alt="Salle d'exposition de statuaire royale"
          loading="lazy"
          className="media-warm absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-forest-darker/88" />
        <div className="absolute inset-0 texture-grain" aria-hidden />
        <div className="absolute inset-0 pattern-fon opacity-10" aria-hidden />

        <div className="relative mx-auto max-w-3xl px-4 py-28 text-center sm:px-6">
          <Reveal variant="scale">
            <p className="eyebrow-gold">Dossier du mois</p>
            <h2 className="mt-5 font-display text-4xl leading-tight text-ivory">
              Les vingt-six trésors restitués
            </h2>
            <p className="mt-5 text-ivory/65">
              Enquête en trois volets sur le retour des œuvres royales d'Abomey, avec les
              conservateurs de Cotonou et les descendants de la cour.
            </p>
            <Button asChild variant="gold" size="lg" className="mt-8 rounded-full">
              <Link to="/culture/royaumes/$slug" params={{ slug: "abomey" }}>
                Lire le dossier
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
