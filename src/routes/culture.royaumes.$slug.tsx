import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs, Rule } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { royaumes } from "@/lib/data";

export const Route = createFileRoute("/culture/royaumes/$slug")({
  loader: ({ params }) => {
    const royaume = royaumes.find((r) => r.slug === params.slug);
    if (!royaume) throw notFound();
    return { royaume };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Royaume introuvable — Dãhomè" }, { name: "robots", content: "noindex" }],
      };
    }
    const { royaume } = loaderData;
    return {
      meta: [
        { title: `${royaume.nom} — Dãhomè` },
        { name: "description", content: royaume.resume },
        { property: "og:title", content: `${royaume.nom} — Dãhomè` },
        { property: "og:description", content: royaume.resume },
      ],
    };
  },
  component: RoyaumeDetail,
});

const frise = [
  { annee: "1620", texte: "Do-Aklin fonde le lignage d'Abomey sur le plateau d'Agbomè." },
  { annee: "1645", texte: "Houégbadja délimite le royaume et institue la coutume du palais." },
  { annee: "1708", texte: "Agadja s'ouvre à l'Atlantique et prend Allada puis Ouidah." },
  { annee: "1818", texte: "Ghézo réorganise l'armée, y compris le corps des Agodjié." },
  {
    annee: "1858",
    texte: "Glélé bâtit son palais ; les tentures appliquées deviennent chronique d'État.",
  },
  { annee: "1892", texte: "Gbêhanzin résiste aux colonnes françaises pendant deux campagnes." },
  {
    annee: "1894",
    texte: "Déportation de Gbêhanzin en Martinique ; fin de l'indépendance du royaume.",
  },
  { annee: "1985", texte: "Les palais royaux d'Abomey sont inscrits au patrimoine mondial." },
  { annee: "2021", texte: "Vingt-six œuvres royales sont restituées par la France." },
];

function RoyaumeDetail() {
  const { royaume } = Route.useLoaderData();

  return (
    <SiteShell>
      <section className="relative isolate flex min-h-[62vh] items-end overflow-hidden">
        <img
          src={royaume.image}
          alt={royaume.nom}
          className="media-warm absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/60 to-forest-deep/20" />
        <div className="relative mx-auto w-full max-w-4xl px-4 pt-28 pb-14 sm:px-6">
          <Breadcrumbs
            dark
            items={[{ label: "Culture", to: "/culture" }, { label: royaume.nom }]}
          />
          <Badge variant="onDark" className="mt-6">
            {royaume.periode}
          </Badge>
          <h1 className="mt-5 font-display text-4xl leading-[1.02] text-ivory sm:text-6xl">
            {royaume.nom}
          </h1>
          <p className="mt-5 max-w-2xl text-ivory/80">{royaume.resume}</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="font-display text-2xl leading-snug text-forest-deep">
          Sur le plateau d'Agbomè, la terre est rouge et la mémoire tenace. Trois siècles durant, le
          Dãhomè y a inventé une manière d'État : une cour, une armée, une administration des
          récoltes, et un art chargé de tenir la chronique.
        </p>

        <div className="mt-8 space-y-6 text-[15px] leading-[1.8] text-foreground/85">
          <p>
            Chaque roi devait laisser derrière lui une devise, un animal emblème et un palais. Les
            bas-reliefs modelés dans la terre des murs racontaient les campagnes, les alliances, les
            proverbes. On ne lisait pas le royaume dans des livres : on le lisait sur ses façades,
            sur les tentures appliquées et sur les récades que portaient les messagers.
          </p>
          <blockquote className="border-l-2 border-accent pl-5 font-display text-xl text-forest-deep italic">
            « Le trou creusé par le premier roi, ses fils continuent de le creuser. »
          </blockquote>
          <p>
            L'ouverture vers la côte, au début du XVIIIe siècle, change tout : le royaume devient
            acteur d'un commerce atlantique dont Ouidah est le port. Cette histoire, douloureuse,
            fait aujourd'hui l'objet d'un travail mémoriel porté par les musées béninois et les
            familles concernées.
          </p>
          <p>
            Sous Ghézo, la réorganisation militaire donne naissance au corps féminin des Agodjié,
            longtemps réduit à un exotisme de récits de voyage, et que les historiennes béninoises
            replacent aujourd'hui dans une logique d'État : recrutement, hiérarchie, discipline,
            rituel.
          </p>
        </div>

        <Rule className="my-14" />

        <h2 className="font-display text-3xl text-forest-deep">Frise chronologique</h2>
        <ol className="mt-8 border-l border-border">
          {frise.map((f, i) => (
            <Reveal key={f.annee} delay={i * 60}>
              <li className="relative py-5 pl-8">
                <span className="absolute top-7 -left-[7px] size-3.5 rounded-full border-2 border-background bg-terracotta" />
                <p className="font-display text-xl text-terracotta">{f.annee}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">{f.texte}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-14 rounded-lg border border-border bg-card p-7">
          <p className="eyebrow">Sur place</p>
          <h3 className="mt-2 font-display text-2xl text-forest-deep">
            Visiter les palais royaux d'Abomey
          </h3>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="gold">
              <Link to="/tourisme/sites/$slug" params={{ slug: "palais-royaux-abomey" }}>
                Fiche du site
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/visite/$slug" params={{ slug: "palais-royaux-abomey" }}>
                Visite virtuelle 360°
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/culture/musees/$slug" params={{ slug: "musee-histoire-abomey" }}>
                Musée historique
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </SiteShell>
  );
}
