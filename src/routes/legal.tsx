import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead } from "@/components/site/Bits";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Mentions légales & confidentialité — DanXomè" },
      {
        name: "description",
        content:
          "Éditeur, hébergement, propriété intellectuelle, données personnelles et conditions d'utilisation de la plateforme DanXomè.",
      },
      { property: "og:title", content: "Mentions légales & confidentialité — DanXomè" },
      { property: "og:description", content: "Cadre juridique de la plateforme DanXomè." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Legal,
});

const sections = [
  {
    titre: "Éditeur",
    corps: [
      "La plateforme DanXomè est éditée en partenariat avec le Ministère du Tourisme, de la Culture et des Arts de la République du Bénin.",
      "Siège : Boulevard de la Marina, Cotonou, Bénin. Contact : bonjour@dahome.bj.",
    ],
  },
  {
    titre: "Propriété intellectuelle",
    corps: [
      "Les textes, photographies et panoramas sont protégés. Toute reproduction commerciale sans autorisation écrite est interdite.",
      "Les œuvres présentées dans la boutique demeurent la propriété de leurs auteurs jusqu'à la vente ; les visuels sont utilisés avec leur accord.",
    ],
  },
  {
    titre: "Données personnelles",
    corps: [
      "Les données collectées (identité, coordonnées, historique de commandes) servent uniquement à la fourniture du service.",
      "Elles ne sont ni vendues ni cédées. Vous pouvez demander leur accès, leur rectification ou leur suppression à tout moment par email.",
    ],
  },
  {
    titre: "Cookies",
    corps: [
      "Seuls des cookies techniques et de mesure d'audience anonymisée sont déposés. Aucun traceur publicitaire n'est utilisé.",
    ],
  },
  {
    titre: "Conditions de vente",
    corps: [
      "Les prix des œuvres d'art sont indiqués en francs CFA, taxes comprises. Les frais de transport sont affichés avant paiement.",
      "Les pièces artisanales étant uniques, un droit de rétractation de 14 jours s'applique hors commandes sur mesure.",
    ],
  },
  {
    titre: "Responsabilité",
    corps: [
      "Les horaires et informations pratiques des sites et musées sont communiqués à titre indicatif et peuvent évoluer selon les cérémonies locales.",
    ],
  },
];

function Legal() {
  return (
    <SiteShell>
      <PageHead
        eyebrow="Cadre juridique"
        title="Mentions légales & confidentialité"
        intro="Transparence sur l'édition du site, l'usage des contenus patrimoniaux et le traitement de vos données."
        crumbs={[{ label: "Mentions légales" }]}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-12">
          {sections.map((s, i) => (
            <article key={s.titre}>
              <p className="eyebrow">0{i + 1}</p>
              <h2 className="mt-2 font-display text-3xl text-forest-deep">{s.titre}</h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {s.corps.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-16 text-xs text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
        </p>
      </section>
    </SiteShell>
  );
}
