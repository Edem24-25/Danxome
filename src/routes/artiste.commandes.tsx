import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Image, LayoutDashboard, Package, UserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/site/DashboardShell";
import { SectionTitle } from "@/components/site/Bits";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatFcfa,
  statutLabel,
  statutsCommandes,
  useCommandes,
  useUpdateCommandeStatut,
  type CommandeStatut,
} from "@/hooks/use-data";
import { useAuth } from "@/contexts/auth";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/artiste/commandes")({
  beforeLoad: () => requireRole(["artiste", "artisan", "admin"]),
  head: () => ({
    meta: [
      { title: "Mes commandes — DanXomè" },
      {
        name: "description",
        content: "Suivez les commandes reçues, validées et en cours sur DanXomè.",
      },
      { property: "og:title", content: "Mes commandes — DanXomè" },
    ],
  }),
  component: Commandes,
});

const items = [
  { to: "/artiste", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/artiste/vitrine", label: "Ma vitrine", icon: Image },
  { to: "/artiste/commandes", label: "Commandes", icon: Package },
  { to: "/contact", label: "Support", icon: Wallet },
  { to: "/profil", label: "Mon profil", icon: UserRound },
];

const filtreCommandes = [
  { id: "toutes", label: "Toutes" },
  { id: "recue", label: "Reçues" },
  { id: "validee", label: "Validées" },
  { id: "en_cours", label: "En cours" },
  { id: "expediee", label: "Expédiées" },
  { id: "livree", label: "Livrées" },
] as const;

const badgeVariant: Record<CommandeStatut, "default" | "gold" | "forest" | "secondary" | "quiet"> =
  {
    recue: "default",
    validee: "gold",
    en_cours: "forest",
    expediee: "secondary",
    livree: "quiet",
    annulee: "secondary",
  };

function Commandes() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const { data: commandes = [], isLoading: loadingCommandes } = useCommandes();
  const updateStatut = useUpdateCommandeStatut();
  const [filtre, setFiltre] = useState<(typeof filtreCommandes)[number]["id"]>("toutes");

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth/login", search: { from: undefined } });
    } else if (!loading && profile && profile.profil === "visiteur") {
      navigate({ to: "/profil" });
    }
  }, [loading, user, profile, navigate]);

  if (loading || !profile || loadingCommandes) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-4xl space-y-6 p-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
          <div className="rounded-xl border border-border">
            <div className="border-b border-border p-4">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-border py-3 last:border-0"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const changer = (ref: string, statut: CommandeStatut) => {
    updateStatut.mutate({ ref, statut });
    toast.success("Statut mis à jour", {
      description: `${statutLabel(statut)} — ${ref}`,
    });
  };

  const visibles = filtre === "toutes" ? commandes : commandes.filter((c) => c.statut === filtre);
  const recues = commandes.filter((c) => c.statut === "recue").length;
  const enCours = commandes.filter((c) => c.statut === "en_cours" || c.statut === "validee").length;
  const livrees = commandes.filter((c) => c.statut === "livree").length;

  return (
    <DashboardShell
      space="Espace artiste"
      items={items}
      title="Mes commandes"
      crumbs={[{ label: "Espace artiste", to: "/artiste" }, { label: "Commandes" }]}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {filtreCommandes.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltre(f.id)}
              className={
                filtre === f.id
                  ? "rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  : "rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground/70 transition-colors hover:bg-forest/10"
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="ml-auto text-sm text-muted-foreground">
          {recues} à traiter · {enCours} en cours · {livrees} livrées
        </p>
      </div>

      <SectionTitle eyebrow="Ventes" title="Commandes reçues" />
      <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-card">
        {visibles.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Aucune commande dans cette catégorie.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Référence</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Pièce</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibles.map((c) => (
                <tr key={c.ref}>
                  <td className="px-4 py-3 font-mono text-xs">{c.ref}</td>
                  <td className="px-4 py-3">{c.client_nom}</td>
                  <td className="px-4 py-3">{c.oeuvre_titre}</td>
                  <td className="px-4 py-3 font-display text-forest-deep">
                    {formatFcfa(c.montant)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={badgeVariant[c.statut]}>{statutLabel(c.statut)}</Badge>
                      <Select
                        value={c.statut}
                        onValueChange={(v) => changer(c.ref, v as CommandeStatut)}
                      >
                        <SelectTrigger className="h-7 w-[9.5rem] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statutsCommandes.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardShell>
  );
}
