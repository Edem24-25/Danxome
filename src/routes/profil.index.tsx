import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  ArrowRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  UserRound,
  Clock,
  Star,
  CreditCard,
  Eye,
  AlertCircle,
} from "lucide-react";
import { ProfilShell } from "@/components/site/ProfilShell";
import { ProfilBadge } from "@/components/site/ProfilBadge";
import { EmptyState, SectionTitle, StatCard } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useOeuvres,
  formatFcfa,
  useFavoris,
  useCommandesClient,
  statutLabel,
} from "@/hooks/use-data";
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

const dateFrFull = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Bonne nuit";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

const badgeVariant: Record<
  string,
  "default" | "gold" | "forest" | "secondary" | "quiet" | "destructive"
> = {
  recue: "default",
  validee: "gold",
  en_cours: "forest",
  expediee: "secondary",
  livree: "quiet",
  annulee: "destructive",
};

function Profil() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const { data: favorisData } = useFavoris();
  const favorisIds = useMemo(() => (favorisData ?? []).map((f) => f.oeuvre_id), [favorisData]);
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
        </div>
      </ProfilShell>
    );
  }

  if (!profile) return null;

  const initiales = `${profile.prenom[0] ?? ""}${profile.nom[0] ?? ""}`.toUpperCase();
  const oeuvresFavorites = oeuvres.filter((o) => favorisIds.includes(o.id));
  const totalDepense = achats.reduce((sum, a) => sum + (a.montant ?? 0), 0);
  const commandesEnCours = achats.filter(
    (a) => a.statut === "recue" || a.statut === "validee" || a.statut === "en_cours",
  ).length;

  return (
    <ProfilShell title={`${getGreeting()} ${profile.prenom}`} crumbs={[{ label: "Mon profil" }]}>
      {/* ═══ HEADER PROFIL ═══ */}
      <Reveal variant="up">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest/10 font-display text-3xl text-forest ring-4 ring-background ring-offset-2">
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
              <span className="absolute -right-1 -bottom-1 size-5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-2xl text-forest-deep">
                  {profile.prenom} {profile.nom}
                </h2>
                <ProfilBadge profil={profile.profil} />
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5" /> {profile.email}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Membre depuis {dateFr(profile.created_at)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild variant="gold" size="sm">
                <Link to="/profil/details">
                  <UserRound className="size-4" /> Modifier
                </Link>
              </Button>
              {profile.profil !== "admin" && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/art/boutique">
                    <ShoppingBag className="size-4" /> Boutique
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <dl className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Phone, label: "Téléphone", valeur: profile.telephone || "Non renseigné" },
              { icon: MapPin, label: "Adresse", valeur: profile.adresse || "Non renseigné" },
              { icon: UserRound, label: "Ville", valeur: profile.ville || "Non renseigné" },
              { icon: Shield, label: "Pays", valeur: profile.pays || "Non renseigné" },
            ].map((d) => (
              <div key={d.label} className="group">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <d.icon className="size-3.5" /> {d.label}
                </dt>
                <dd className="mt-1 text-sm text-forest-deep transition-colors group-hover:text-forest">
                  {d.valeur}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      {/* ═══ ALERTE COMPTE EN ATTENTE ═══ */}
      {(profile.profil === "artiste" || profile.profil === "artisan") &&
        profile.statut === "en_attente" && (
          <Reveal variant="up" delay={50}>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="size-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Compte en attente de validation
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    Votre compte {profile.profil} sera examiné par un administrateur. Vous recevrez
                    une notification une fois votre profil validé.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        )}

      {/* ═══ STATS ANIMÉES ═══ */}
      {profile.profil !== "admin" && (
        <Reveal variant="up" delay={100}>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Commandes"
              value={String(achats.length)}
              {...(commandesEnCours > 0 ? { delta: `${commandesEnCours} en cours` } : {})}
              icon={<ShoppingBag className="size-4" />}
            />
            <StatCard
              label="Dépensé"
              value={formatFcfa(totalDepense)}
              icon={<CreditCard className="size-4" />}
            />
            <StatCard
              label="Favoris"
              value={String(favorisIds.length)}
              icon={<Heart className="size-4" />}
            />
            <StatCard
              label="Dernière commande"
              value={achats.length > 0 ? dateFrFull(achats[0]!.date) : "—"}
              icon={<Clock className="size-4" />}
            />
          </div>
        </Reveal>
      )}

      {/* ═══ CONTENU PRINCIPAL ═══ */}
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Colonne gauche — Commandes récentes */}
        {profile.profil !== "admin" && (
          <Reveal variant="up" delay={200}>
            <div>
              <SectionTitle
                eyebrow="Activité récente"
                title="Mes commandes"
                intro={`${achats.length} commande${achats.length !== 1 ? "s" : ""} au total`}
                action={
                  achats.length > 0 ? (
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/profil/commandes">
                        Tout voir <ArrowRight />
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
              {achatsLoading ? (
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                    >
                      <Skeleton className="size-14 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : achats.length === 0 ? (
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
                <ul className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                  {achats.slice(0, 5).map((a) => (
                    <li
                      key={a.ref}
                      className="group flex items-center gap-4 p-4 transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-forest/8 font-display text-xl text-forest-deep transition-colors group-hover:bg-forest group-hover:text-ivory">
                        {a.oeuvre_titre.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-forest-deep">
                            {a.oeuvre_titre}
                          </p>
                          <Badge variant={badgeVariant[a.statut] ?? "default"} className="shrink-0">
                            {statutLabel(a.statut)}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {a.artiste_nom} · {a.ref} · {dateFrFull(a.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg text-forest-deep">
                          {formatFcfa(a.montant)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        )}

        {/* Colonne droite — Favoris + Actions rapides */}
        <aside className="space-y-6">
          {/* Favoris */}
          {profile.profil !== "admin" && (
            <Reveal variant="up" delay={300}>
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">
                    <Heart className="mr-1 inline size-3" /> Favoris
                  </p>
                  {oeuvresFavorites.length > 0 && (
                    <Badge variant="quiet">{oeuvresFavorites.length}</Badge>
                  )}
                </div>
                {oeuvresLoading ? (
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-lg" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-2 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : oeuvresFavorites.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Aucune œuvre en favori pour l'instant.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {oeuvresFavorites.slice(0, 4).map((o) => (
                      <li key={o.slug}>
                        <Link
                          to="/art/oeuvres/$slug"
                          params={{ slug: o.slug }}
                          className="group/fav flex items-center gap-3 rounded-lg p-2 -mx-2 transition-colors hover:bg-secondary/50"
                        >
                          <img
                            src={o.image_url}
                            alt={o.titre}
                            loading="lazy"
                            className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-border"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-forest-deep transition-colors group-hover/fav:text-forest">
                              {o.titre}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatFcfa(o.prix)}</p>
                          </div>
                          <Star className="size-3.5 text-gold opacity-0 transition-opacity group-hover/fav:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {oeuvresFavorites.length > 0 && (
                  <Button asChild variant="ghost" size="sm" className="mt-4 w-full">
                    <Link to="/profil/favoris">
                      Voir tous les favoris <ArrowRight />
                    </Link>
                  </Button>
                )}
              </div>
            </Reveal>
          )}

          {/* Actions rapides */}
          <Reveal variant="up" delay={400}>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="eyebrow">Actions rapides</p>
              <div className="mt-4 space-y-2">
                {profile.profil !== "admin" && (
                  <Link
                    to="/art/boutique"
                    className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/50"
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                      <ShoppingBag className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-forest-deep">Boutique</p>
                      <p className="text-xs text-muted-foreground">Explorer les œuvres</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
                <Link
                  to="/evenements"
                  className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/50"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-terracotta/10 text-terracotta transition-colors group-hover:bg-terracotta group-hover:text-terracotta-foreground">
                    <Eye className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-forest-deep">Événements</p>
                    <p className="text-xs text-muted-foreground">Calendrier culturel</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/tourisme"
                  className="group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/50"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-forest/10 text-forest transition-colors group-hover:bg-forest group-hover:text-forest-light">
                    <MapPin className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-forest-deep">Tourisme</p>
                    <p className="text-xs text-muted-foreground">Sites & visites virtuelles</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Sécurité */}
          <Reveal variant="up" delay={500}>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="eyebrow">
                <Shield className="mr-1 inline size-3" /> Sécurité
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Protégez votre compte avec un mot de passe fort.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to="/profil/mot-de-passe">Changer le mot de passe</Link>
              </Button>
            </div>
          </Reveal>
        </aside>
      </div>
    </ProfilShell>
  );
}
