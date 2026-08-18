import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarCheck, Clock, MapPin, Star, Video, Users, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs, Rule, SectionTitle } from "@/components/site/Bits";
import { ContentCard } from "@/components/site/ContentCard";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSite, useSites } from "@/hooks/use-data";

export const Route = createFileRoute("/tourisme/sites/$slug")({
  head: () => ({
    meta: [
      { title: "Site touristique — DanXomè" },
      { name: "description", content: "Découvrez ce site touristique du Bénin." },
    ],
  }),
  component: SiteDetail,
});

const infos = [
  { icon: Clock, label: "Durée conseillée", value: "2 h 30 à une demi-journée" },
  { icon: Users, label: "Format", value: "Guide francophone, groupes de 12 max." },
  { icon: CalendarCheck, label: "Meilleure période", value: "Novembre à février, saison sèche" },
];

function SiteDetail() {
  const { slug } = Route.useParams();
  const { data: site, isLoading } = useSite(slug);
  const { data: allSites = [] } = useSites();
  const autres = allSites.filter((s) => s.slug !== slug).slice(0, 3);

  if (isLoading) {
    return (
      <SiteShell>
        <Skeleton className="h-[28rem] w-full" />
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-10 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </SiteShell>
    );
  }

  if (!site) {
    throw notFound();
  }

  return (
    <SiteShell>
      <section className="relative">
        <div className="absolute inset-0">
          <img
            src={site.image_url}
            alt={site.nom}
            className="media-warm size-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/70 to-forest-deep/30" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 sm:pt-10 sm:pb-20 lg:px-8">
          <Breadcrumbs dark items={[{ label: "Tourisme", to: "/tourisme" }, { label: site.nom }]} />
          <div className="mt-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold">{site.type}</Badge>
              {site.virtuel && <Badge variant="onDark">Visite 360° disponible</Badge>}
            </div>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] text-ivory sm:text-5xl lg:text-6xl">
              {site.nom}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ivory/80">{site.resume}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-ivory/80">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4 text-accent" /> {site.region}, Bénin
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-accent text-accent" />
                <strong className="text-ivory">{site.note.toFixed(1)}</strong> · {site.avis_count} avis
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {site.virtuel && (
                <Button asChild variant="gold" size="lg">
                  <Link to="/visite/$slug" params={{ slug: site.slug }}>
                    <Video /> Visite virtuelle 360°
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <article className="min-w-0">
            <p className="eyebrow">Le récit du lieu</p>
            <div className="mt-5 space-y-5 text-base leading-relaxed text-foreground/85">
              <p className="text-lg leading-relaxed text-forest-deep">
                {site.nom} appartient à ces lieux où l'histoire du Bénin se lit à ciel ouvert :
                l'architecture, les matières et les gestes des habitants racontent la même
                continuité, du royaume aux générations d'aujourd'hui.
              </p>
              <p>
                On y accède par une route qui prépare le regard — latérite, marché, cortège de
                motos-taxis — avant que le site n'apparaisse. Les guides du réseau DanXomè, formés
                avec les autorités locales, ouvrent la visite par le contexte historique puis
                laissent la place aux détails : un bas-relief, une empreinte, un silence.
              </p>
              <blockquote className="border-l-2 border-accent pl-5 font-display text-xl leading-snug text-forest-deep italic">
                « Ici, on ne montre pas des pierres. On transmet une parole qui a survécu. »
              </blockquote>
              <p>
                Prévoyez de l'eau, des chaussures fermées et un vêtement léger à manches longues en
                fin de journée. La photographie est autorisée hors espaces cultuels signalés ; les
                dons collectés sur place financent l'entretien communautaire du site.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {infos.map((info) => (
                <div key={info.label} className="rounded-lg border border-border bg-card p-5">
                  <info.icon className="size-5 text-accent" />
                  <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    {info.label}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-forest-deep">{info.value}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-lg bg-forest-deep p-6 text-ivory">
              <div className="pattern-fon absolute inset-0 opacity-20" aria-hidden />
              <div className="relative">
                <p className="eyebrow text-accent">Avant de venir</p>
                <h3 className="mt-3 font-display text-2xl">Découvrez le site en 360°</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/75">
                  {site.virtuel
                    ? "Parcourez les espaces principaux depuis chez vous, panorama par panorama."
                    : "La captation 360° de ce site est en cours de production."}
                </p>
                {site.virtuel && (
                  <Button asChild variant="onDark" className="mt-5 w-full">
                    <Link to="/visite/$slug" params={{ slug: site.slug }}>
                      Lancer la visite <ArrowRight />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </div>

        <Rule />

        <SectionTitle
          eyebrow="À proximité"
          title="Continuer le voyage"
          action={
            <Button asChild variant="outline">
              <Link to="/tourisme">Tous les sites</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {autres.map((s, i) => (
            <Reveal key={s.slug} delay={i * 80}>
              <ContentCard
                to="/tourisme/sites/$slug"
                params={{ slug: s.slug }}
                image={s.image_url}
                titre={s.nom}
                meta={`${s.region} · ${s.type}`}
                resume={s.resume}
                note={s.note}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
