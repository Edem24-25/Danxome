import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  CalendarDays,
  Eye,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Palette,
  ShoppingCart,
  Users,
  FileText,
} from "lucide-react";
import { DashboardShell } from "@/components/site/DashboardShell";
import { SectionTitle, StatCard } from "@/components/site/Bits";
import { Button } from "@/components/ui/button";
import { useAdminStats, formatFcfa } from "@/hooks/use-data";
import { useAuth } from "@/contexts/auth";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => requireRole(["admin"]),
  head: () => ({
    meta: [
      { title: "Back-office institutionnel — DanXomè" },
      {
        name: "description",
        content:
          "Modération des contenus, validation des artisans partenaires et suivi de fréquentation du patrimoine béninois.",
      },
      { property: "og:title", content: "Back-office institutionnel — DanXomè" },
      { property: "og:description", content: "Modération, partenaires et statistiques DanXomè." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const items = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { to: "/admin/verifications", label: "Vérifications", icon: FileText },
  { to: "/admin/oeuvres", label: "Œuvres", icon: Palette },
  { to: "/admin/sites", label: "Sites", icon: Eye },
  { to: "/admin/evenements", label: "Événements", icon: CalendarDays },
  { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { to: "/admin/stats", label: "Statistiques", icon: MessageSquare },
];

function Admin() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth/login", search: { from: undefined } });
    }
    if (!loading && profile && profile.profil !== "admin") {
      navigate({ to: "/profil" });
    }
  }, [loading, user, profile, navigate]);

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
      items={items}
      title="Pilotage de la plateforme"
      crumbs={[{ label: "Administration" }]}
      actions={
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/stats">
              <MessageSquare className="mr-1 size-4" /> Statistiques
            </Link>
          </Button>
          <Button asChild variant="gold" size="sm">
            <Link to="/admin/utilisateurs">
              <Users className="mr-1 size-4" /> Utilisateurs
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Utilisateurs"
          value={statsLoading ? "…" : String(stats?.totalUsers ?? 0)}
          delta={`${stats?.totalVisiteurs ?? 0} visiteurs`}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Œuvres publiées"
          value={statsLoading ? "…" : String(stats?.totalOeuvres ?? 0)}
          icon={<Palette className="size-4" />}
        />
        <StatCard
          label="Commandes"
          value={statsLoading ? "…" : String(stats?.totalCommandes ?? 0)}
          delta={formatFcfa(stats?.revenueTotal ?? 0)}
          icon={<ShoppingCart className="size-4" />}
        />
        <StatCard
          label="Sites touristiques"
          value={statsLoading ? "…" : String(stats?.totalSites ?? 0)}
          delta={`${stats?.totalEvenements ?? 0} événements`}
          icon={<Eye className="size-4" />}
        />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <SectionTitle eyebrow="Accès rapides" title="Gestion de la plateforme" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              {
                to: "/admin/utilisateurs",
                label: "Utilisateurs",
                desc: "Gérer les comptes, rôles et validations",
                icon: Users,
                color: "bg-forest/10 text-forest",
              },
              {
                to: "/admin/oeuvres",
                label: "Œuvres",
                desc: "Modérer les œuvres d'art",
                icon: Palette,
                color: "bg-amber-100 text-amber-600",
              },
              {
                to: "/admin/sites",
                label: "Sites touristiques",
                desc: "Gérer les sites et visites virtuelles",
                icon: Eye,
                color: "bg-blue-100 text-blue-600",
              },
              {
                to: "/admin/evenements",
                label: "Événements",
                desc: "Planifier les événements culturels",
                icon: CalendarDays,
                color: "bg-purple-100 text-purple-600",
              },
              {
                to: "/admin/newsletter",
                label: "Newsletter",
                desc: "Gérer les abonnés email",
                icon: Mail,
                color: "bg-green-100 text-green-600",
              },
              {
                to: "/admin/stats",
                label: "Statistiques",
                desc: "Tableaux de bord et métriques",
                icon: MessageSquare,
                color: "bg-rose-100 text-rose-600",
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent/50 hover:bg-accent/5"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}
                >
                  <item.icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-forest-deep group-hover:text-accent">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-secondary/50 p-6">
            <p className="eyebrow">Vue rapide</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Artistes</span>
                <span className="font-semibold text-forest-deep">{stats?.totalArtistes ?? 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Artisans</span>
                <span className="font-semibold text-forest-deep">{stats?.totalArtisans ?? 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Avis publiés</span>
                <span className="font-semibold text-forest-deep">{stats?.totalAvis ?? 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Abonnés newsletter</span>
                <span className="font-semibold text-forest-deep">
                  {stats?.totalNewsletter ?? 0}
                </span>
              </li>
              <li className="border-t border-border pt-3 flex items-center justify-between">
                <span className="text-muted-foreground">Revenu total</span>
                <span className="font-bold text-forest-deep">
                  {formatFcfa(stats?.revenueTotal ?? 0)}
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-forest-deep p-6 text-ivory">
            <p className="eyebrow text-accent">Conformité</p>
            <p className="mt-3 text-sm leading-relaxed text-ivory/75">
              Les contenus patrimoniaux sont validés par le Ministère du Tourisme, de la Culture et
              des Arts avant publication. Chaque modification est historisée.
            </p>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
