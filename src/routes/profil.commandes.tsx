import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { ProfilShell } from "@/components/site/ProfilShell";
import { EmptyState, SectionTitle } from "@/components/site/Bits";
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

const badgeVariant: Record<string, "default" | "gold" | "forest" | "secondary" | "quiet"> = {
  recue: "default",
  validee: "gold",
  en_cours: "forest",
  expediee: "secondary",
  livree: "quiet",
};

function ProfilCommandes() {
  const { data: commandes = [], isLoading } = useCommandesClient();

  return (
    <ProfilShell
      title="Mes commandes"
      crumbs={[{ label: "Mon profil", to: "/profil" }, { label: "Commandes" }]}
    >
      <SectionTitle
        eyebrow="Historique"
        title={`${commandes.length} commande${commandes.length > 1 ? "s" : ""} passée${commandes.length > 1 ? "s" : ""}`}
      />
      {isLoading ? (
        <div className="space-y-4 py-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      ) : commandes.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-5" />}
          title="Aucune commande pour l'instant"
          description="Votre historique apparaîtra ici dès votre premier achat dans la boutique."
          action={
            <Button asChild variant="gold">
              <Link to="/art/boutique">Découvrir la boutique</Link>
            </Button>
          }
        />
      ) : (
        <div className="mt-6 space-y-4">
          {commandes.map((c) => (
            <div key={c.ref} className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-forest-deep">{c.oeuvre_titre}</p>
                <p className="text-xs text-muted-foreground">
                  {c.artiste_nom} · {dateFr(c.date)}
                </p>
              </div>
              <p className="font-display text-forest-deep">{formatFcfa(c.montant)}</p>
              <Badge variant={badgeVariant[c.statut] ?? "default"}>
                {statutLabel(c.statut)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </ProfilShell>
  );
}
