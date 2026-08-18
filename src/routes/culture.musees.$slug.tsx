import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { Accessibility, Clock, MapPin } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { useMusee } from "@/hooks/use-data";
import museum from "@/assets/museum.jpg";
import bronze from "@/assets/art-bronze.jpg";
import heroAbomey from "@/assets/hero-abomey.jpg";

export const Route = createFileRoute("/culture/musees/$slug")({
  head: () => ({
    meta: [
      { title: "Musée — DanXomè" },
      { name: "description", content: "Découvrez les musées du Bénin." },
    ],
  }),
  component: MuseeDetail,
});

function MuseeDetail() {
  const { slug } = Route.useParams();
  const { data: musee, isLoading, isError } = useMusee(slug);

  useEffect(() => {
    if (!isLoading && isError) notFound();
  }, [isLoading, isError]);

  if (isLoading) {
    return (
      <SiteShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Chargement…</p>
        </div>
      </SiteShell>
    );
  }

  if (!musee) return null;

  const galerie = [musee.image_url, museum, bronze, heroAbomey];

  return (
    <SiteShell>
      <PageHead
        eyebrow={`Musée · ${musee.ville}`}
        title={musee.nom}
        intro={musee.resume}
        crumbs={[{ label: "Culture", to: "/culture" }, { label: musee.nom }]}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-4 sm:grid-rows-2">
          {galerie.map((img, i) => (
            <Reveal key={i} delay={i * 80} className={i === 0 ? "sm:col-span-2 sm:row-span-2" : ""}>
              <div className="h-full overflow-hidden rounded-lg">
                <img
                  src={img}
                  alt={`${musee.nom} — vue ${i + 1}`}
                  loading="lazy"
                  className="media-warm size-full min-h-[180px] object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="font-display text-3xl text-forest-deep">La collection</h2>
            <div className="mt-5 space-y-5 text-[15px] leading-[1.8] text-foreground/85">
              <p>
                Le parcours suit trois fils : la cour et ses insignes, la vie religieuse, et les
                échanges atlantiques. Les cartels sont trilingues — français, anglais, fon — et les
                médiateurs proposent chaque samedi une visite en langue locale.
              </p>
              <p>
                Une salle est consacrée aux tentures appliquées, chronique textile des règnes, dont
                plusieurs pièces ont été restaurées sur place par un atelier béninois entre 2019 et
                2023.
              </p>
            </div>

            <h3 className="mt-10 font-display text-2xl text-forest-deep">Accès</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              À {musee.ville}, à dix minutes du centre. Parking gratuit, arrêt de zémidjan devant
              l'entrée. Salles du rez-de-chaussée accessibles en fauteuil.
            </p>
          </div>

          <aside className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-24">
            <p className="eyebrow">Infos pratiques</p>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-forest" />
                <div>
                  {musee.horaires.map((h: string) => (
                    <p key={h} className="text-foreground/85">
                      {h}
                    </p>
                  ))}
                </div>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-forest" />
                <span className="text-foreground/85">{musee.ville}, Bénin</span>
              </li>
              <li className="flex gap-3">
                <Accessibility className="mt-0.5 size-4 shrink-0 text-forest" />
                <span className="text-foreground/85">Accès PMR partiel · audioguide inclus</span>
              </li>
            </ul>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/tourisme/carte">Voir sur la carte</Link>
            </Button>
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}
