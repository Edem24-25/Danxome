import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { useMemo } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs, Rule, SectionTitle } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvenement, useEvenements } from "@/hooks/use-data";

export const Route = createFileRoute("/evenements/$slug")({
  head: () => ({
    meta: [
      { title: "Événement — Agenda DanXomè" },
      { name: "description", content: "Agenda culturel du Bénin." },
      { property: "og:title", content: "Événement — Agenda DanXomè" },
      { property: "og:description", content: "Agenda culturel du Bénin." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EvenementDetail,
});

const programme = [
  { heure: "09h00", titre: "Ouverture et libations", lieu: "Place centrale" },
  {
    heure: "11h30",
    titre: "Cortège des dignitaires et tambours royaux",
    lieu: "Voie processionnelle",
  },
  { heure: "15h00", titre: "Démonstrations de masques et danses", lieu: "Grande esplanade" },
  { heure: "19h30", titre: "Concert et veillée de contes", lieu: "Scène principale" },
];

function EvenementDetail() {
  const { slug } = Route.useParams();
  const { data: evenement, isLoading: isLoadingEvenement } = useEvenement(slug);
  const { data: evenements, isLoading: isLoadingAutres } = useEvenements();

  const autres = useMemo(
    () => (evenements ?? []).filter((e) => e.slug !== evenement?.slug).slice(0, 3),
    [evenements, evenement?.slug],
  );

  if (isLoadingEvenement || isLoadingAutres) {
    return (
      <SiteShell>
        <Skeleton className="h-[30rem] w-full" />
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </SiteShell>
    );
  }

  if (!evenement) {
    throw notFound();
  }

  return (
    <SiteShell>
      <section className="relative">
        <img
          src={evenement.image_url}
          alt={`${evenement.titre} à ${evenement.lieu}`}
          className="h-[24rem] w-full object-cover sm:h-[30rem]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/70 to-forest-deep/25" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <Breadcrumbs
            dark
            items={[{ label: "Événements", to: "/evenements" }, { label: evenement.titre }]}
          />
          <Badge variant="onDark" className="mt-5">
            {evenement.categorie}
          </Badge>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] text-ivory sm:text-6xl">
            {evenement.titre}
          </h1>
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-ivory/80">
            <span className="flex items-center gap-2">
              <CalendarDays className="size-4 text-accent" /> {evenement.date}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-accent" /> {evenement.lieu}
            </span>
            <span className="flex items-center gap-2">
              <Users className="size-4 text-accent" /> Tout public
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:px-8">
        <div className="min-w-0">
          <p className="font-display text-2xl leading-relaxed text-forest-deep">
            {evenement.resume}
          </p>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Porté par les communautés et les familles royales, ce rendez-vous rassemble chaque
              année plusieurs milliers de visiteurs venus du Bénin, de la sous-région et de la
              diaspora. Les cérémonies sont ouvertes au public, à l'exception des rites réservés aux
              initiés.
            </p>
            <p>
              Les couvents, les collectifs de danse et les orchestres traditionnels préparent la
              fête plusieurs semaines à l'avance. Sur place, marchés d'artisanat, cuisines de rue et
              ateliers de percussion prolongent la programmation officielle.
            </p>
          </div>

          <Rule className="my-12" />

          <SectionTitle eyebrow="Programme" title="Une journée type" />
          <ol className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {programme.map((p) => (
              <li key={p.heure} className="flex flex-wrap items-baseline gap-4 p-5">
                <span className="flex items-center gap-2 font-display text-xl text-terracotta">
                  <Clock className="size-4" /> {p.heure}
                </span>
                <span className="font-semibold text-forest-deep">{p.titre}</span>
                <span className="text-sm text-muted-foreground">{p.lieu}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-border bg-secondary/50 p-6">
            <p className="eyebrow">Participer</p>
            <p className="mt-3 font-display text-3xl text-forest-deep">Accès libre</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Renseignez-vous auprès des organisateurs pour les visites guidées et événements
              spéciaux.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline" className="w-full">
                <Link to="/contact">Contacter l'organisateur</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 text-sm">
            <p className="eyebrow">Bon à savoir</p>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              <li>Prévoir une tenue légère et de l'eau : l'affluence est forte en journée.</li>
              <li>Photographies autorisées, sauf pendant les rites d'initiation.</li>
              <li>Hébergements à réserver au moins un mois à l'avance.</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Poursuivre" title="Autres rendez-vous de la saison" />
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {autres.map((e, i) => (
            <Reveal key={e.slug} delay={i * 80}>
              <Link
                to="/evenements/$slug"
                params={{ slug: e.slug }}
                className="group block overflow-hidden rounded-lg border border-border bg-card"
              >
                <img
                  src={e.image_url}
                  alt={e.titre}
                  loading="lazy"
                  className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <div className="p-5">
                  <Badge variant="quiet">{e.categorie}</Badge>
                  <h3 className="mt-2 font-display text-xl text-forest-deep">{e.titre}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {e.date} · {e.lieu}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
