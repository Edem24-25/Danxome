import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Palette as PaletteIcon,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/site/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth";
import { useAdminNewsletter, useAdminDeleteNewsletter } from "@/hooks/use-data";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/admin/newsletter")({
  beforeLoad: () => requireRole(["admin"]),
  head: () => ({
    meta: [
      { title: "Newsletter — DanXomè" },
      {
        name: "description",
        content: "Gestion des abonnés à la newsletter.",
      },
    ],
  }),
  component: NewsletterAdmin,
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

function NewsletterAdmin() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth/login", search: { from: undefined } });
    }
    if (!loading && profile && profile.profil !== "admin") {
      navigate({ to: "/profil" });
    }
  }, [loading, user, profile, navigate]);

  const { data: subscribers = [], isLoading } = useAdminNewsletter();
  const deleteSubscriber = useAdminDeleteNewsletter();

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Retirer "${email}" de la newsletter ?`)) return;
    try {
      await deleteSubscriber.mutateAsync(id);
      showFeedback("success", "Abonné retiré.");
    } catch {
      showFeedback("error", "Erreur lors de la suppression.");
    }
  };

  const filtered = subscribers.filter((s) => s.email?.toLowerCase().includes(search.toLowerCase()));

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
      title="Gestion de la newsletter"
      crumbs={[{ label: "Administration", to: "/admin" }, { label: "Newsletter" }]}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin">
            <ArrowLeft className="mr-1 size-4" /> Retour
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {feedback && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-forest/10 text-forest">
                <Mail className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Abonnés</p>
                <p className="text-2xl font-semibold text-forest-deep">{subscribers.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Mail className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ce mois</p>
                <p className="text-2xl font-semibold text-forest-deep">
                  {
                    subscribers.filter((s) => {
                      const d = new Date(s.created_at);
                      const now = new Date();
                      return (
                        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-forest-deep">Abonnés</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Aucun abonné.</p>
          ) : (
            <div className="mt-6 space-y-2">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-forest-deep">{s.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Inscrit le {new Date(s.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(s.id, s.email)}
                    disabled={deleteSubscriber.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
