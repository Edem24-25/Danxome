import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  LayoutDashboard,
  MessageSquare,
  Package,
  Palette as PaletteIcon,
  Search,
  ShieldCheck,
  Users,
  FileText,
} from "lucide-react";
import { DashboardShell } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth";
import {
  useAdminProfiles,
  useAdminUpdateRole,
  useAdminUpdateProfilStatut,
  useAdminArtistesEnAttente,
} from "@/hooks/use-data";
import { requireRole } from "@/lib/auth-guard";
import type { ProfilType } from "@/lib/types/user";

export const Route = createFileRoute("/admin/utilisateurs")({
  beforeLoad: () => requireRole(["admin"]),
  head: () => ({
    meta: [
      { title: "Gestion des utilisateurs — DanXomè" },
      {
        name: "description",
        content: "Gestion complète des utilisateurs, artistes et artisans.",
      },
    ],
  }),
  component: Utilisateurs,
});

const navItems = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { to: "/admin/verifications", label: "Vérifications", icon: FileText },
  { to: "/admin/oeuvres", label: "Œuvres", icon: PaletteIcon },
  { to: "/admin/sites", label: "Sites", icon: Eye },
  { to: "/admin/evenements", label: "Événements", icon: MessageSquare },
  { to: "/admin/newsletter", label: "Newsletter", icon: Package },
  { to: "/admin/stats", label: "Statistiques", icon: ShieldCheck },
];

const roles: { value: ProfilType; label: string }[] = [
  { value: "visiteur", label: "Visiteur" },
  { value: "artiste", label: "Artiste" },
  { value: "artisan", label: "Artisan" },
  { value: "admin", label: "Admin" },
];

function Utilisateurs() {
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

  const { data: profiles = [], isLoading: loadingProfiles } = useAdminProfiles();
  const updateRole = useAdminUpdateRole();
  const updateProfilStatut = useAdminUpdateProfilStatut();
  const { data: artistesEnAttente } = useAdminArtistesEnAttente();

  const handleUpdateRole = async (id: string, profil: ProfilType) => {
    try {
      await updateRole.mutateAsync({ id, profil });
      showFeedback("success", "Rôle mis à jour.");
    } catch {
      showFeedback("error", "Erreur lors de la mise à jour du rôle.");
    }
  };

  const handleValidateProfil = async (id: string, statut: "valide" | "rejete" | "suspendu") => {
    try {
      await updateProfilStatut.mutateAsync({ id, statut });
      const labels: Record<"valide" | "rejete" | "suspendu", string> = {
        valide: "Profil validé.",
        rejete: "Profil rejeté.",
        suspendu: "Profil suspendu.",
      };
      showFeedback("success", labels[statut]);
    } catch {
      showFeedback("error", "Erreur lors de la mise à jour du profil.");
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      p.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      p.nom?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const enAttente = artistesEnAttente?.profiles ?? [];
  const artistesMap = artistesEnAttente?.artistes ?? {};

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
      title="Gestion des utilisateurs"
      crumbs={[{ label: "Administration", to: "/admin" }, { label: "Utilisateurs" }]}
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

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold text-forest-deep">{profiles.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Visiteurs</p>
            <p className="text-2xl font-semibold text-forest-deep">
              {profiles.filter((p) => p.profil === "visiteur").length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Artistes</p>
            <p className="text-2xl font-semibold text-forest-deep">
              {profiles.filter((p) => p.profil === "artiste").length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">En attente</p>
            <p className="text-2xl font-semibold text-amber-600">{enAttente.length}</p>
          </div>
        </div>

        <Tabs defaultValue="tous">
          <TabsList>
            <TabsTrigger value="tous" className="gap-1.5">
              <Users className="size-3.5" /> Tous
            </TabsTrigger>
            <TabsTrigger value="attente" className="gap-1.5">
              <ShieldCheck className="size-3.5" /> En attente ({enAttente.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tous">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-forest-deep">Tous les utilisateurs</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {loadingProfiles ? (
                <div className="flex justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" />
                </div>
              ) : filteredProfiles.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Aucun utilisateur.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {filteredProfiles.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-forest-deep">
                            {p.prenom} {p.nom}
                          </p>
                          <Badge variant={p.profil === "admin" ? "default" : "quiet"}>
                            {p.profil}
                          </Badge>
                          {p.statut === "en_attente" && (
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              En attente
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Inscrit le {new Date(p.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select
                          value={p.profil}
                          onValueChange={(v) => handleUpdateRole(p.id, v as ProfilType)}
                          disabled={updateRole.isPending || p.id === profile.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {p.statut === "en_attente" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 border-green-300 text-green-700 hover:bg-green-100"
                              onClick={() => handleValidateProfil(p.id, "valide")}
                              disabled={updateProfilStatut.isPending}
                            >
                              Valider
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 border-red-300 text-red-700 hover:bg-red-100"
                              onClick={() => handleValidateProfil(p.id, "rejete")}
                              disabled={updateProfilStatut.isPending}
                            >
                              Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attente">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-lg text-forest-deep">
                Comptes en attente de validation
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Validez ou rejetez les comptes artistes et artisans.
              </p>

              {enAttente.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Aucun compte en attente.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {enAttente.map((p) => {
                    const info = artistesMap[p.id];
                    return (
                      <div
                        key={p.id}
                        className="rounded-lg border border-amber-200 bg-amber-50 p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-forest-deep">
                                {p.prenom} {p.nom}
                              </p>
                              <Badge variant="outline" className="border-amber-300 text-amber-700">
                                {p.profil}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 border-green-300 text-green-700 hover:bg-green-100"
                              onClick={() => handleValidateProfil(p.id, "valide")}
                              disabled={updateProfilStatut.isPending}
                            >
                              Valider
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 border-red-300 text-red-700 hover:bg-red-100"
                              onClick={() => handleValidateProfil(p.id, "rejete")}
                              disabled={updateProfilStatut.isPending}
                            >
                              Rejeter
                            </Button>
                          </div>
                        </div>
                        {info?.metier && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Spécialité : {info.metier}
                          </p>
                        )}
                        {info?.bio && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {info.bio}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
