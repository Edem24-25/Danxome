import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { ProfilShell } from "@/components/site/ProfilShell";
import { ProfilBadge } from "@/components/site/ProfilBadge";
import { EmptyState, SectionTitle, StatCard } from "@/components/site/Bits";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOeuvres, formatFcfa, useFavoris, useCommandesClient } from "@/hooks/use-data";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/profil/")({
  head: () => ({
    meta: [
      { title: "Mon profil — DanXomè" },
      {
        name: "description",
        content: "Vos informations personnelles, commandes et favoris sur DanXomè.",
      },
      { property: "og:title", content: "Mon profil — DanXomè" },
      { property: "og:description", content: "Votre espace personnel DanXomè." },
    ],
  }),
  component: Profil,
});

const dateFr = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "long" }).format(new Date(iso));

function Profil() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const { data: favorisData } = useFavoris();
  const favorisIds = (favorisData ?? []).map(f => f.oeuvre_id);
  const { data: oeuvres = [], isLoading: oeuvresLoading } = useOeuvres();
  const { data: achats = [], isLoading: achatsLoading } = useCommandesClient();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth/login", search: { from: undefined } });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <ProfilShell title="Chargement…" crumbs={[{ label: "Mon profil" }]}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-6 w-32" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </ProfilShell>
    );
  }

  if (!profile) return null;

  const initiales = `${profile.prenom[0] ?? ""}${profile.nom[0] ?? ""}`.toUpperCase();
  const oeuvresFavorites = oeuvres.filter((o) => favorisIds.includes(o.id));
  const details = [
    {
      icon: Phone,
      label: "Téléphone",
      valeur: profile.telephone || "—",
    },
    {
      icon: MapPin,
      label: "Adresse",
      valeur: profile.adresse || "—",
    },
    {
      icon: UserRound,
      label: "Ville",
      valeur: profile.ville || "—",
    },
    {
      icon: Shield,
      label: "Pays",
      valeur: profile.pays || "—",
    },
  ];

  return (
    <ProfilShell title={`Bonjour ${profile.prenom}`} crumbs={[{ label: "Mon profil" }]}>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest/10 font-display text-2xl text-forest">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={`${profile.prenom} ${profile.nom}`}
                className="size-full object-cover"
              />
            ) : (
              initiales || "D"
            )}
          </div>
          <div className="min-w-0">
            <p className="eyebrow">Mon profil</p>
            <h2 className="font-display text-2xl text-forest-deep">
              {profile.prenom} {profile.nom}
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" /> {profile.email}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ProfilBadge profil={profile.profil} />
              <span className="text-xs text-muted-foreground">
                Membre depuis {dateFr(profile.created_at)}
              </span>
            </div>
          </div>
          <div className="sm:ml-auto">
            <Button asChild variant="gold" size="sm">
              <Link to="/profil/details">Modifier mes informations</Link>
            </Button>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <d.icon className="size-3.5" /> {d.label}
              </dt>
              <dd className="mt-1 text-sm text-forest-deep">{d.valeur}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {profile.profil !== "admin" && (
          <>
            <StatCard
              label="Commandes passées"
              value={String(achats.length)}
              icon={<ShoppingBag className="size-4" />}
            />
            <StatCard
              label="Favoris"
              value={String(favorisIds.length)}
              icon={<Heart className="size-4" />}
            />
          </>
        )}
        {profile.profil !== "visiteur" && (
          <StatCard
            label="Mon espace"
            value={profile.profil === "admin" ? "Administration" : "Art & artisanat"}
            icon={<UserRound className="size-4" />}
          />
        )}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {profile.profil !== "admin" && (
          <div>
            <SectionTitle
              eyebrow="Boutique"
              title="Mes commandes récentes"
              action={
                <Button asChild variant="ghost" size="sm">
                  <Link to="/profil/commandes">Tout voir</Link>
                </Button>
              }
            />
            {achats.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="size-5" />}
                title="Aucune commande pour l'instant"
                description="Passez votre première commande dans la boutique d'œuvres d'art béninois."
                action={
                  <Button asChild variant="gold">
                    <Link to="/art/boutique">Découvrir la boutique</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                {achats.slice(0, 3).map((a) => (
                  <li key={a.ref} className="flex items-center gap-4 p-4">
                    <div className="size-16 flex items-center justify-center rounded-md bg-forest/10 text-forest-deep font-display text-lg">
                      {a.oeuvre_titre.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-forest-deep">{a.ref}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.oeuvre_titre} · {dateFr(a.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-forest-deep">{formatFcfa(a.montant)}</p>
                      <p className="text-xs text-emerald-600">Payée</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <aside className="space-y-6">
          {profile.profil !== "admin" && (
            <div className="rounded-lg border border-border bg-secondary/50 p-6">
              <p className="eyebrow">Favoris</p>
              {oeuvresFavorites.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Aucune œuvre en favori pour l'instant.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {oeuvresFavorites.slice(0, 3).map((o) => (
                    <li key={o.slug}>
                      <Link
                        to="/art/oeuvres/$slug"
                        params={{ slug: o.slug }}
                        className="flex items-center gap-3 text-sm text-foreground/80 hover:text-terracotta"
                      >
                    <img
                      src={o.image_url}
                      alt={o.titre}
                      loading="lazy"
                      className="size-10 rounded object-cover"
                    />
                        {o.titre}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild variant="ghost" size="sm" className="mt-4">
                <Link to="/profil/favoris">
                  Voir mes favoris <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
          <div className="rounded-lg border border-border bg-card p-6">
            <p className="eyebrow">Mot de passe</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Changez votre mot de passe pour sécuriser votre compte.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/profil/mot-de-passe">Modifier</Link>
            </Button>
          </div>
        </aside>
      </div>
    </ProfilShell>
  );
}
