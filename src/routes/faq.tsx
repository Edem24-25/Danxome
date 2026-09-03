import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead } from "@/components/site/Bits";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const faq = [
  {
    q: "Comment découvrir les sites touristiques ?",
    r: "Explorez la rubrique Tourisme pour consulter les fiches détaillées de chaque site, avec photos, histoire et informations pratiques. La carte interactive vous permet de visualiser tous les sites par région.",
  },
  {
    q: "Les visites virtuelles 360° sont-elles gratuites ?",
    r: "Oui. Les panoramas des palais royaux d'Abomey, de Ganvié et de la Porte du Non-Retour sont librement accessibles, sans compte.",
  },
  {
    q: "Comment sont sélectionnés les artisans de la boutique ?",
    r: "Chaque atelier candidate depuis l'espace artiste. Un comité vérifie l'origine des pièces, les matériaux et les conditions de production avant publication.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    r: "Mobile Money (MTN, Moov) et carte bancaire. Les paiements sont encaissés en FCFA ; la conversion éventuelle est indiquée avant validation.",
  },
  {
    q: "Livrez-vous à l'international ?",
    r: "Oui, avec emballage renforcé et suivi. Les délais varient de 7 à 21 jours selon la destination et la taille de la pièce.",
  },
  {
    q: "Puis-je utiliser les contenus à des fins pédagogiques ?",
    r: "Les textes et images de la plateforme peuvent être cités en contexte éducatif avec mention de la source. Pour un usage commercial, écrivez-nous.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Questions fréquentes — DanXomè" },
      {
        name: "description",
        content:
          "Visites 360°, boutique artisanale, paiements Mobile Money et livraisons : toutes les réponses.",
      },
      { property: "og:title", content: "Questions fréquentes — DanXomè" },
      { property: "og:description", content: "Aide et réponses sur la plateforme DanXomè." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.r },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  const [ouvert, setOuvert] = useState<number | null>(0);

  return (
    <SiteShell>
      <PageHead
        eyebrow="Aide"
        title="Questions fréquentes"
        intro="Visites immersives, boutique et paiements : l'essentiel en un coup d'œil."
        crumbs={[{ label: "FAQ" }]}
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {faq.map((f, i) => {
            const actif = ouvert === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOuvert(actif ? null : i)}
                  aria-expanded={actif}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left"
                >
                  <span className="font-display text-xl text-forest-deep">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      "size-5 shrink-0 text-terracotta transition-transform",
                      actif && "rotate-180",
                    )}
                  />
                </button>
                {actif && (
                  <p className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{f.r}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-lg border border-border bg-secondary/50 p-8 text-center">
          <h2 className="font-display text-2xl text-forest-deep">Une autre question ?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            L'équipe répond sous deux jours ouvrés.
          </p>
          <Button asChild variant="gold" className="mt-6">
            <Link to="/contact">Nous écrire</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
