import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag, Truck } from "lucide-react";
import { ProfilShell } from "@/components/site/ProfilShell";
import { EmptyState, SectionTitle } from "@/components/site/Bits";
import { Button } from "@/components/ui/button";
import { formatFcfa } from "@/lib/data";
import { lireAchats } from "@/lib/achats";

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

function ProfilCommandes() {
  const achats = lireAchats();

  return (
    <ProfilShell
      title="Mes commandes"
      crumbs={[{ label: "Mon profil", to: "/profil" }, { label: "Commandes" }]}
    >
      <SectionTitle
        eyebrow="Historique"
        title={`${achats.length} commande${achats.length > 1 ? "s" : ""} passée${achats.length > 1 ? "s" : ""}`}
      />
      {achats.length === 0 ? (
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
        <div className="mt-6 space-y-6">
          {achats.map((a) => (
            <div key={a.reference} className="rounded-lg border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <p className="font-display text-lg text-forest-deep">{a.reference}</p>
                  <p className="text-xs text-muted-foreground">{dateFr(a.date)}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="size-3.5" /> Payée
                </span>
              </div>
              <ul className="divide-y divide-border px-5">
                {a.articles.map((art, i) => (
                  <li key={`${a.reference}-${i}`} className="flex items-center gap-4 py-3">
                    <img
                      src={art.image}
                      alt={art.titre}
                      loading="lazy"
                      className="size-14 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-forest-deep">{art.titre}</p>
                      <p className="text-xs text-muted-foreground">
                        {art.artiste} · {art.quantite} × {formatFcfa(art.prix)}
                      </p>
                    </div>
                    <p className="font-display text-forest-deep">
                      {formatFcfa(art.prix * art.quantite)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border bg-secondary/40 px-5 py-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="size-4" /> Livraison
                  </span>
                  <span>{formatFcfa(a.livraison)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-forest-deep">Total</span>
                  <span className="font-display text-xl text-forest-deep">
                    {formatFcfa(a.total + a.livraison)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ProfilShell>
  );
}
