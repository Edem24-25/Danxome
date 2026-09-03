import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  LayoutDashboard,
  MessageSquare,
  Package,
  Palette as PaletteIcon,
  ShieldCheck,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/site/DashboardShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { useAdminStats, formatFcfa } from "@/hooks/use-data";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/admin/stats")({
  beforeLoad: () => requireRole(["admin"]),
  head: () => ({
    meta: [
      { title: "Statistiques — DanXomè" },
      {
        name: "description",
        content: "Statistiques et métriques de la plateforme DanXomè.",
      },
    ],
  }),
  component: StatsAdmin,
});

const navItems = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { to: "/admin/oeuvres", label: "Œuvres", icon: PaletteIcon },
  { to: "/admin/sites", label: "Sites", icon: Eye },
  { to: "/admin/evenements", label: "Événements", icon: MessageSquare },
  { to: "/admin/newsletter", label: "Newsletter", icon: Package },
  { to: "/admin/stats", label: "Statistiques", icon: ShieldCheck },
];

function StatsAdmin() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth/login", search: { from: undefined } });
    }
    if (!loading && profile && profile.profil !== "admin") {
      navigate({ to: "/profil" });
    }
  }, [loading, user, profile, navigate]);

  const { data: stats, isLoading } = useAdminStats();

  if (loading || !profile || profile.profil !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
      </div>
    );
  }

  return (
    <DashboardShell
      space="Administration"
      items={navItems}
      title="Statistiques"
      crumbs={[{ label: "Administration", to: "/admin" }, { label: "Statistiques" }]}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin">
            <ArrowLeft className="mr-1 size-4" /> Retour
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" />
          </div>
        ) : stats ? (
          <>
            {/* KPIs principaux */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-forest/10 text-forest">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Utilisateurs</p>
                    <p className="text-2xl font-bold text-forest-deep">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <PaletteIcon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Œuvres</p>
                    <p className="text-2xl font-bold text-forest-deep">{stats.totalOeuvres}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <ShoppingCart className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Commandes</p>
                    <p className="text-2xl font-bold text-forest-deep">{stats.totalCommandes}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <Package className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenu total</p>
                    <p className="text-2xl font-bold text-forest-deep">
                      {formatFcfa(stats.revenueTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Détails utilisateurs */}
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-display text-lg text-forest-deep">Répartition des utilisateurs</h3>
                <div className="mt-4 space-y-4">
                  {[
                    { label: "Visiteurs", value: stats.totalVisiteurs, color: "bg-forest" },
                    { label: "Artistes", value: stats.totalArtistes, color: "bg-amber-500" },
                    { label: "Artisans", value: stats.totalArtisans, color: "bg-blue-500" },
                  ].map((item) => {
                    const pct = stats.totalUsers > 0 ? (item.value / stats.totalUsers) * 100 : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="font-medium text-forest-deep">{item.label}</span>
                          <span className="text-muted-foreground">
                            {item.value} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-display text-lg text-forest-deep">Commandes par statut</h3>
                <div className="mt-4 space-y-3">
                  {Object.entries(stats.commandesParStatut).map(([statut, count]) => (
                    <div
                      key={statut}
                      className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5"
                    >
                      <span className="text-sm font-medium capitalize text-forest-deep">
                        {statut.replace("_", " ")}
                      </span>
                      <span className="text-sm font-bold text-forest-deep">{count}</span>
                    </div>
                  ))}
                  {Object.keys(stats.commandesParStatut).length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Aucune commande pour le moment.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Autres métriques */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-forest/10 text-forest">
                    <Eye className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sites touristiques</p>
                    <p className="text-lg font-semibold text-forest-deep">{stats.totalSites}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                    <CalendarDays className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Événements</p>
                    <p className="text-lg font-semibold text-forest-deep">{stats.totalEvenements}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Star className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avis</p>
                    <p className="text-lg font-semibold text-forest-deep">{stats.totalAvis}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <MessageSquare className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Newsletter</p>
                    <p className="text-lg font-semibold text-forest-deep">{stats.totalNewsletter}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </DashboardShell>
  );
}
