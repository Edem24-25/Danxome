import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead, Rule, SectionTitle } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { images } from "@/lib/data";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos de la plateforme Dãhomè" },
      {
        name: "description",
        content:
          "Dãhomè valorise le patrimoine culturel, artistique et touristique du Bénin avec les institutions et les artisans.",
      },
      { property: "og:title", content: "À propos de la plateforme Dãhomè" },
      {
        property: "og:description",
        content: "Notre mission : transmettre et faire vivre le patrimoine béninois.",
      },
    ],
  }),
  component: APropos,
});

const piliers = [
  {
    titre: "Transmettre",
    texte:
      "Documenter les royaumes, les langues et les rites avec les chercheurs, les familles royales et les musées nationaux.",
  },
  {
    titre: "Faire vivre",
    texte:
      "Ouvrir les sites au public : visites guidées, parcours 360°, agenda des fêtes et médiation pour les scolaires.",
  },
  {
    titre: "Rémunérer",
    texte:
      "Offrir aux artisans une vitrine directe et un paiement Mobile Money sans intermédiaire abusif.",
  },
];

const chiffres = [
  { valeur: "12", label: "départements couverts" },
  { valeur: "55", label: "langues documentées" },
  { valeur: "480", label: "artisans partenaires" },
  { valeur: "1 240", label: "archives sonores" },
];

function APropos() {
  return (
    <SiteShell>
      <PageHead
        eyebrow="Institution"
        title="Une maison numérique pour le patrimoine béninois"
        intro="Dãhomè est une plateforme publique-privée qui rassemble musées, sites classés, communautés et artisans autour d'un même récit."
        crumbs={[{ label: "À propos" }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* ═══ MISSION ═══ */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal variant="left">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={images.museum}
                alt="Salle de musée présentant des objets du patrimoine béninois"
                loading="lazy"
                className="aspect-4/3 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/30 to-transparent" />
            </div>
          </Reveal>
          <Reveal variant="right" delay={120}>
            <SectionTitle eyebrow="Notre mission" title="Le patrimoine comme bien commun" />
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                Du plateau d'Abomey aux lagunes du sud, le Bénin conserve une densité patrimoniale
                rare. Notre rôle est de rendre ce corpus lisible, navigable et utile — aux visiteurs
                comme aux communautés qui en sont dépositaires.
              </p>
              <p>
                Chaque fiche est co-écrite avec les institutions concernées, relue par des
                historiens et enrichie de témoignages locaux. Les revenus de la boutique reviennent
                majoritairement aux ateliers.
              </p>
            </div>
            <Button asChild variant="cultural" className="mt-8 rounded-full">
              <Link to="/contact">Devenir partenaire</Link>
            </Button>
          </Reveal>
        </div>

        <Rule />

        {/* ═══ PILIERS ═══ */}
        <div className="grid gap-6 sm:grid-cols-3">
          {piliers.map((p, i) => (
            <Reveal key={p.titre} variant="up" delay={i * 90}>
              <article className="group relative h-full overflow-hidden rounded-xl border border-border bg-card p-7 transition-all duration-400 hover:-translate-y-1 hover:shadow-cultural hover:border-accent/30">
                <div
                  className="pattern-fon absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30"
                  aria-hidden
                />
                <div className="relative">
                  <p className="font-display text-5xl text-gradient-gold">{i + 1}</p>
                  <h3 className="mt-4 font-display text-2xl text-forest-deep">{p.titre}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.texte}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Rule />

        {/* ═══ CHIFFRES ═══ */}
        <Reveal variant="scale">
          <div className="relative overflow-hidden rounded-2xl bg-forest-darker p-8 text-ivory sm:p-12">
            <div className="absolute inset-0 pattern-fon opacity-10" aria-hidden />
            <div className="absolute inset-0 texture-grain" aria-hidden />
            <div className="relative grid gap-8 sm:grid-cols-4">
              {chiffres.map((c) => (
                <div key={c.label}>
                  <p className="font-display text-5xl text-gradient-gold">{c.valeur}</p>
                  <p className="mt-2 text-sm text-ivory/65">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </SiteShell>
  );
}
