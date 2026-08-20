import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead, Rule } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDossier } from "@/hooks/use-data";

export const Route = createFileRoute("/culture/dossiers/$slug")({
  head: () => ({
    meta: [
      { title: "Dossier — DanXomè" },
      { name: "description", content: "Dossier éditorial sur le patrimoine béninois." },
    ],
  }),
  component: DossierPage,
});

const dateFr = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );

function DossierPage() {
  const { slug } = Route.useParams();
  const { data: dossier, isLoading, error } = useDossier(slug);

  if (isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-10 w-3/4" />
          <Skeleton className="mt-2 h-6 w-1/2" />
          <Skeleton className="mt-8 aspect-[21/9] w-full rounded-xl" />
          <div className="mt-12 space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </SiteShell>
    );
  }

  if (error || !dossier) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-4xl px-4 py-32 text-center sm:px-6 lg:px-8">
          <BookOpen className="mx-auto size-12 text-muted-foreground/40" />
          <h2 className="mt-4 font-display text-2xl text-forest-deep">Dossier introuvable</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Ce dossier n'existe pas ou a été déplacé.
          </p>
          <Button asChild variant="gold" className="mt-6">
            <Link to="/culture">Retour à la culture</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  const sections = (dossier.sections ?? []) as { titre: string; contenu: string; image_url?: string }[];

  return (
    <SiteShell>
      <PageHead
        eyebrow={dossier.categorie}
        title={dossier.titre}
        intro={dossier.sous_titre ?? undefined}
        crumbs={[
          { label: "Culture", to: "/culture" },
          { label: "Dossiers", to: "/culture" },
          { label: dossier.titre },
        ]}
        aside={
          <Button asChild variant="ghost" size="sm">
            <Link to="/culture">
              <ArrowLeft className="size-4" /> Retour
            </Link>
          </Button>
        }
      />

      {/* ═══ IMAGE À LA UNE ═══ */}
      {dossier.image_url && (
        <Reveal variant="up">
          <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={dossier.image_url}
                alt={dossier.titre}
                className="media-warm aspect-[21/9] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/60 via-transparent to-transparent" />
            </div>
          </div>
        </Reveal>
      )}

      {/* ═══ META ═══ */}
      <Reveal variant="up" delay={100}>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-4 px-4 pt-8 text-sm text-muted-foreground sm:px-6">
          {dossier.auteur && (
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" /> {dossier.auteur}
            </span>
          )}
          {dossier.date_publication && (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" /> {dateFr(dossier.date_publication)}
            </span>
          )}
          <Badge variant="quiet">{dossier.categorie}</Badge>
        </div>
      </Reveal>

      {/* ═══ RÉSUMÉ ═══ */}
      {dossier.resume && (
        <Reveal variant="up" delay={150}>
          <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 lg:px-8">
            <p className="text-lg leading-relaxed text-forest-deep/80 italic">
              « {dossier.resume} »
            </p>
          </div>
        </Reveal>
      )}

      <Rule className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8" />

      {/* ═══ SECTIONS ═══ */}
      <article className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        {sections.length > 0 ? (
          <div className="space-y-12">
            {sections.map((section, i) => (
              <Reveal key={i} variant="up" delay={i * 60}>
                <section>
                  <h2 className="font-display text-2xl leading-snug text-forest-deep sm:text-3xl">
                    {section.titre}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-foreground/85">
                    {section.contenu.split("\n\n").map((para, j) => (
                      <p key={j}>{para}</p>
                    ))}
                  </div>
                  {section.image_url && (
                    <img
                      src={section.image_url}
                      alt={section.titre}
                      loading="lazy"
                      className="media-warm mt-6 w-full rounded-xl object-cover"
                    />
                  )}
                </section>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            Ce dossier sera bientôt disponible.
          </p>
        )}
      </article>

      {/* ═══ NAVIGATION BAS ═══ */}
      <div className="border-t border-border bg-secondary/30">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-8 sm:px-6 lg:px-8">
          <Button asChild variant="ghost">
            <Link to="/culture">
              <ArrowLeft className="size-4" /> Tous les dossiers
            </Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
