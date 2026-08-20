import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShoppingBag,
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { ProfilShell } from "@/components/site/ProfilShell";
import { EmptyState, SectionTitle, StatCard } from "@/components/site/Bits";
import { Reveal } from "@/components/site/Reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFcfa, useCommandesClient, statutLabel } from "@/hooks/use-data";

export const Route = createFileRoute("/profil/commandes")({
  head: () => ({
    meta: [
      { title: "Mes commandes — DanXomè" },
      { name: "description", content: "L'historique de vos commandes d'œuvres d'art." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilCommandes,
});

const dateFr = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const badgeVariant: Record<string, "default" | "gold" | "forest" | "secondary" | "quiet" | "destructive"> = {
  recue: "default",
  validee: "gold",
  en_cours: "forest",
  expediee: "secondary",
  livree: "quiet",
  annulee: "destructive",
};

const STATUTS = ["tous", "recue", "validee", "en_cours", "expediee", "livree", "annulee"] as const;

function ProfilCommandes() {
  const { data: commandes = [], isLoading } = useCommandesClient();
  const [filtre, setFiltre] = useState<string>("tous");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filtre === "tous" ? commandes : commandes.filter((c) => c.statut === filtre)),
    [commandes, filtre],
  );

  const totalDepense = useMemo(
    () => commandes.reduce((sum, c) => sum + (c.montant ?? 0), 0),
    [commandes],
  );

  const statsByStatut = useMemo(() => {
    const map: Record<string, number> = {};
    commandes.forEach((c) => {
      map[c.statut] = (map[c.statut] || 0) + 1;
    });
    return map;
  }, [commandes]);

  return (
    <ProfilShell
      title="Mes commandes"
      crumbs={[{ label: "Mon profil", to: "/profil" }, { label: "Commandes" }]}
    >
      {/* Stats résumé */}
      {!isLoading && commandes.length > 0 && (
        <Reveal variant="up">
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total commandes"
              value={String(commandes.length)}
              icon={<Package className="size-4" />}
            />
            <StatCard
              label="Dépensé"
              value={formatFcfa(totalDepense)}
              icon={<CreditCard className="size-4" />}
            />
            <StatCard
              label="Moyenne"
              value={formatFcfa(commandes.length > 0 ? totalDepense / commandes.length : 0)}
              icon={<TrendingUp className="size-4" />}
            />
          </div>
        </Reveal>
      )}

      {/* Filtres */}
      {!isLoading && commandes.length > 0 && (
        <Reveal variant="up" delay={100}>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            {STATUTS.map((s) => (
              <button
                key={s}
                onClick={() => setFiltre(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  filtre === s
                    ? "bg-forest text-ivory shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {s === "tous" ? "Tous" : statutLabel(s)}
                {s !== "tous" && statsByStatut[s] ? (
                  <span className="ml-1 inline-flex size-4 items-center justify-center rounded-full bg-foreground/10 text-[10px]">
                    {statsByStatut[s]}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </Reveal>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-4 py-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <Skeleton className="size-14 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-5" />}
          title={filtre === "tous" ? "Aucune commande pour l'instant" : "Aucune commande avec ce statut"}
          description={
            filtre === "tous"
              ? "Votre historique apparaîtra ici dès votre premier achat dans la boutique."
              : "Essayez un autre filtre ou revenez plus tard."
          }
          action={
            filtre === "tous" ? (
              <Button asChild variant="gold">
                <Link to="/art/boutique">Découvrir la boutique</Link>
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setFiltre("tous")}>
                Voir toutes les commandes
              </Button>
            )
          }
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} commande{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-3">
            {filtered.map((c, i) => {
              const isExpanded = expanded === c.ref;
              return (
                <Reveal key={c.ref} variant="up" delay={i * 40}>
                  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                    <div
                      className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-secondary/30"
                      onClick={() => setExpanded(isExpanded ? null : c.ref)}
                    >
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-forest/8 font-display text-xl text-forest-deep">
                        {c.oeuvre_titre.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-forest-deep">{c.oeuvre_titre}</p>
                          <Badge variant={badgeVariant[c.statut] ?? "default"} className="shrink-0">
                            {statutLabel(c.statut)}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {c.artiste_nom} · {dateFr(c.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg text-forest-deep">{formatFcfa(c.montant)}</p>
                        <p className="text-xs text-muted-foreground">Réf. {c.ref}</p>
                      </div>
                      <button className="ml-2 shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary">
                        {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-border bg-secondary/20 px-4 py-4">
                        <dl className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs font-semibold text-muted-foreground">Référence</dt>
                            <dd className="mt-0.5 text-sm text-forest-deep">{c.ref}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold text-muted-foreground">Date</dt>
                            <dd className="mt-0.5 text-sm text-forest-deep">{dateFr(c.date)}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold text-muted-foreground">Artiste</dt>
                            <dd className="mt-0.5 text-sm text-forest-deep">{c.artiste_nom}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold text-muted-foreground">Montant</dt>
                            <dd className="mt-0.5 font-display text-lg text-forest-deep">
                              {formatFcfa(c.montant)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </>
      )}
    </ProfilShell>
  );
}
