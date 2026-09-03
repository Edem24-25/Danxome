import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Heart, Info, Ruler, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { Breadcrumbs, Rule, SectionTitle } from "@/components/site/Bits";
import { ContentCard } from "@/components/site/ContentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOeuvre,
  useOeuvres,
  formatFcfa,
  useAddToCart,
  useFavoris,
  useToggleFavori,
} from "@/hooks/use-data";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/art/oeuvres/$slug")({
  head: () => ({
    meta: [{ title: "Œuvre — DanXomè" }],
  }),
  component: OeuvreDetail,
});

function OeuvreDetail() {
  const { slug } = Route.useParams();
  const { data: oeuvre, isLoading, isError } = useOeuvre(slug);
  const { data: oeuvres } = useOeuvres();
  const addToCart = useAddToCart();
  const { peutCommander } = useAuth();
  const { data: favorisData } = useFavoris();
  const toggleFavori = useToggleFavori();
  const [ajoute, setAjoute] = useState(false);

  useEffect(() => {
    if (!isLoading && (isError || !oeuvre)) {
      throw notFound();
    }
  }, [isLoading, isError, oeuvre]);

  useEffect(() => {
    if (oeuvre) {
      document.title = `${oeuvre.titre} par ${oeuvre.artiste?.nom ?? "Artiste"} — DanXomè`;
    }
  }, [oeuvre]);

  if (isLoading || !oeuvre) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">
          <div className="flex gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <Skeleton className="aspect-[4/5] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  const artiste = oeuvre.artiste;
  const similaires = (oeuvres ?? [])
    .filter((o) => o.slug !== oeuvre.slug && o.categorie === oeuvre.categorie)
    .slice(0, 3);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Art & artisanat", to: "/art" },
            { label: "Boutique", to: "/art/boutique" },
            { label: oeuvre.titre },
          ]}
        />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-lg border border-border bg-secondary/40">
            <img
              src={oeuvre.image_url}
              alt={oeuvre.titre}
              className="media-warm aspect-[4/5] w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <Badge variant="quiet">{oeuvre.categorie}</Badge>
            <h1 className="mt-4 font-display text-4xl leading-tight text-forest-deep sm:text-5xl">
              {oeuvre.titre}
            </h1>
            {artiste && (
              <Link
                to="/art/artistes/$slug"
                params={{ slug: artiste.slug }}
                className="mt-4 inline-flex items-center gap-3 rounded-md border border-border bg-card p-2.5 pr-4 transition-colors hover:border-accent"
              >
                <img
                  src={artiste.image_url}
                  alt={artiste.nom}
                  className="media-warm size-10 rounded-md object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <span>
                  <span className="block text-sm font-semibold text-forest-deep">
                    {artiste.nom}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {artiste.metier} · {artiste.ville}
                  </span>
                </span>
              </Link>
            )}
            <p className="mt-6 text-base leading-relaxed text-foreground/85">
              {oeuvre.description}
            </p>

            <p className="mt-7 font-display text-4xl text-forest-deep">{formatFcfa(oeuvre.prix)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pièce unique · certificat d'authenticité de l'atelier
            </p>

            {peutCommander ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => {
                    addToCart.mutate({ oeuvreId: oeuvre.id });
                    setAjoute(true);
                  }}
                >
                  {ajoute ? <Check /> : <ShoppingBag />}
                  {ajoute ? "Ajouté au panier" : "Ajouter au panier"}
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/art/panier">Voir le panier</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={
                    favorisData?.some((f) => f.oeuvre_id === oeuvre.id)
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                  onClick={() => toggleFavori.mutate(oeuvre.id)}
                >
                  <Heart
                    className={
                      favorisData?.some((f) => f.oeuvre_id === oeuvre.id)
                        ? "fill-terracotta text-terracotta"
                        : ""
                    }
                  />
                </Button>
              </div>
            ) : (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-4 text-sm text-muted-foreground">
                <Info className="mt-0.5 size-5 shrink-0 text-accent" />
                <p>
                  L'achat d'œuvres est réservé aux visiteurs. Votre espace{" "}
                  {artiste ? "d'artiste" : "pro"} permet de gérer votre vitrine et vos commandes.
                </p>
              </div>
            )}

            <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
              <li className="flex items-center gap-3">
                <Ruler className="size-4 text-accent" /> Origine : {oeuvre.region}, Bénin
              </li>
              <li className="flex items-center gap-3">
                <Truck className="size-4 text-accent" /> Expédition sécurisée en caisse bois, 7 à 14
                jours
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-accent" /> Paiement simulé — projet de
                démonstration
              </li>
            </ul>
          </div>
        </div>

        {similaires.length > 0 && (
          <>
            <Rule />
            <SectionTitle eyebrow="Dans la même veine" title="Œuvres proches" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similaires.map((o) => (
                <ContentCard
                  key={o.slug}
                  to="/art/oeuvres/$slug"
                  params={{ slug: o.slug }}
                  image={o.image_url}
                  titre={o.titre}
                  meta={`${o.categorie} · ${o.artiste?.nom ?? ""}`}
                  ratio="portrait"
                  footer={formatFcfa(o.prix)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </SiteShell>
  );
}
