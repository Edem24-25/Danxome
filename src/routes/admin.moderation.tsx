import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Eye,
  LayoutDashboard,
  MessageSquare,
  Package,
  Palette as PaletteIcon,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  useAdminAvis,
  useDeleteAdminAvis,
  useAdminCommandes,
  useAdminUpdateCommandeStatut,
  useAdminProfiles,
  useAdminUpdateRole,
  useAdminUpdateProfilStatut,
  useAdminArtistesEnAttente,
  statutsCommandes,
  statutLabel,
  formatFcfa,
} from "@/hooks/use-data";
import { requireRole } from "@/lib/auth-guard";
import type { CommandeStatut } from "@/hooks/use-data";
import type { ProfilType } from "@/lib/types/user";

export const Route = createFileRoute("/admin/moderation")({
  beforeLoad: () => requireRole(["admin"]),
  head: () => ({
    meta: [
      { title: "Modération — DanXomè" },
      {
        name: "description",
        content: "Modération des avis, commandes et utilisateurs.",
      },
    ],
  }),
  component: Moderation,
});

const navItems = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/admin/moderation", label: "Modération", icon: Eye },
  { to: "/culture", label: "Contenus", icon: PaletteIcon },
  { to: "/evenements", label: "Événements", icon: CalendarDays },
  { to: "/art", label: "Partenaires", icon: Users },
  { to: "/profil", label: "Mon profil", icon: UserRound },
];

const roles: { value: ProfilType; label: string }[] = [
  { value: "visiteur", label: "Visiteur" },
  { value: "artiste", label: "Artiste" },
  { value: "artisan", label: "Artisan" },
  { value: "admin", label: "Admin" },
];

function Moderation() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();

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

  // --- Avis ---
  const { data: avis = [], isLoading: loadingAvis } = useAdminAvis();
  const deleteAvis = useDeleteAdminAvis();

  const handleDeleteAvis = async (id: string) => {
    try {
      await deleteAvis.mutateAsync(id);
      showFeedback("success", "Avis supprimé.");
    } catch {
      showFeedback("error", "Erreur lors de la suppression de l'avis.");
    }
  };

  // --- Commandes ---
  const { data: commandes = [], isLoading: loadingCommandes } = useAdminCommandes();
  const updateStatut = useAdminUpdateCommandeStatut();

  const handleUpdateStatut = async (id: string, statut: CommandeStatut) => {
    try {
      await updateStatut.mutateAsync({ id, statut });
      showFeedback("success", "Statut mis à jour.");
    } catch {
      showFeedback("error", "Erreur lors de la mise à jour du statut.");
    }
  };

  // --- Profiles ---
  const { data: profiles = [], isLoading: loadingProfiles } = useAdminProfiles();
  const updateRole = useAdminUpdateRole();

  const handleUpdateRole = async (id: string, profil: ProfilType) => {
    try {
      await updateRole.mutateAsync({ id, profil });
      showFeedback("success", "Rôle mis à jour.");
    } catch {
      showFeedback("error", "Erreur lors de la mise à jour du rôle.");
    }
  };

  // --- Validation profils ---
  const updateProfilStatut = useAdminUpdateProfilStatut();
  const { data: artistesEnAttente, isLoading: loadingArtistesAttente } =
    useAdminArtistesEnAttente();

  const handleValidateProfil = async (id: string, statut: "valide" | "rejete") => {
    try {
      await updateProfilStatut.mutateAsync({ id, statut });
      showFeedback("success", statut === "valide" ? "Profil validé et activé." : "Profil rejeté.");
    } catch {
      showFeedback("error", "Erreur lors de la validation du profil.");
    }
  };

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
      title="Modération"
      crumbs={[{ label: "Administration", to: "/admin" }, { label: "Modération" }]}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin">
            <ArrowLeft className="mr-1 size-4" /> Retour
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Feedback */}
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

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Star className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avis</p>
                <p className="text-lg font-semibold text-forest-deep">{avis.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Package className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Commandes</p>
                <p className="text-lg font-semibold text-forest-deep">{commandes.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <Users className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Utilisateurs</p>
                <p className="text-lg font-semibold text-forest-deep">{profiles.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="avis">
          <TabsList>
            <TabsTrigger value="avis" className="gap-1.5">
              <MessageSquare className="size-3.5" /> Avis
            </TabsTrigger>
            <TabsTrigger value="commandes" className="gap-1.5">
              <Package className="size-3.5" /> Commandes
            </TabsTrigger>
            <TabsTrigger value="validation" className="gap-1.5">
              <ShieldCheck className="size-3.5" /> Validation
            </TabsTrigger>
            <TabsTrigger value="utilisateurs" className="gap-1.5">
              <Users className="size-3.5" /> Utilisateurs
            </TabsTrigger>
          </TabsList>

          {/* ======================== AVIS ======================== */}
          <TabsContent value="avis">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-lg text-forest-deep">Avis des visiteurs</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {avis.length} avis au total. Supprimez les contenus inappropriés.
              </p>

              {loadingAvis ? (
                <div className="flex justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" />
                </div>
              ) : avis.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">Aucun avis.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {avis.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-forest-deep">{a.plat_slug}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`size-3 ${
                                  i < a.note
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="quiet" className="text-xs">
                            {a.note}/5
                          </Badge>
                        </div>
                        {a.commentaire && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {a.commentaire}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(a.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteAvis(a.id)}
                        disabled={deleteAvis.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ======================== COMMANDES ======================== */}
          <TabsContent value="commandes">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-lg text-forest-deep">Commandes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gérez le statut de chaque commande.
              </p>

              {loadingCommandes ? (
                <div className="flex justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" />
                </div>
              ) : commandes.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">Aucune commande.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {commandes.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-forest-deep">{c.ref}</p>
                          <Badge variant="quiet">{statutLabel(c.statut)}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {c.oeuvre_titre} — {c.artiste_nom}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.client_nom} · {formatFcfa(c.montant)} ·{" "}
                          {new Date(c.date).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <Select
                          value={c.statut}
                          onValueChange={(v) => handleUpdateStatut(c.id, v as CommandeStatut)}
                          disabled={updateStatut.isPending}
                        >
                          <SelectTrigger className="w-[160px]">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ======================== VALIDATION ======================== */}
          <TabsContent value="validation">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-lg text-forest-deep">Validation des comptes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Validez ou rejetez les comptes artistes et artisans en attente.
              </p>

              {loadingArtistesAttente ? (
                <div className="flex justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" />
                </div>
              ) : (
                (() => {
                  const enAttente = artistesEnAttente?.profiles ?? [];
                  const artistesMap = artistesEnAttente?.artistes ?? {};
                  return enAttente.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                      Aucun compte en attente de validation.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {enAttente.map((p) => {
                        const artisteInfo = artistesMap[p.id];
                        return (
                          <div
                            key={p.id}
                            className="rounded-lg border border-amber-200 bg-amber-50 p-5"
                          >
                            {/* En-tête */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-forest-deep">
                                    {p.prenom} {p.nom}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="border-amber-300 text-amber-700"
                                  >
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
                                  <CheckCircle className="size-4" /> Valider
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 border-red-300 text-red-700 hover:bg-red-100"
                                  onClick={() => handleValidateProfil(p.id, "rejete")}
                                  disabled={updateProfilStatut.isPending}
                                >
                                  <XCircle className="size-4" /> Rejeter
                                </Button>
                              </div>
                            </div>

                            {/* Détails du profil */}
                            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                              {artisteInfo?.metier && (
                                <div>
                                  <span className="text-muted-foreground">Spécialité :</span>
                                  <span className="ml-1 font-medium text-forest-deep">
                                    {artisteInfo.metier}
                                  </span>
                                </div>
                              )}
                              {p.ville && (
                                <div>
                                  <span className="text-muted-foreground">Ville :</span>
                                  <span className="ml-1 font-medium text-forest-deep">
                                    {p.ville}
                                  </span>
                                </div>
                              )}
                              {p.telephone && (
                                <div>
                                  <span className="text-muted-foreground">Téléphone :</span>
                                  <span className="ml-1 font-medium text-forest-deep">
                                    {p.telephone}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="text-muted-foreground">Inscrit le :</span>
                                <span className="ml-1 font-medium text-forest-deep">
                                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                            </div>

                            {/* Bio / Description */}
                            {artisteInfo?.bio && (
                              <div className="mt-3 rounded-md bg-white/60 p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Description :
                                </p>
                                <p className="text-sm text-forest-deep">{artisteInfo.bio}</p>
                              </div>
                            )}

                            {/* Portfolio */}
                            {artisteInfo?.portfolio_url && (
                              <div className="mt-2">
                                <a
                                  href={artisteInfo.portfolio_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-terracotta hover:underline"
                                >
                                  Voir le portfolio →
                                </a>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}

              {/* Profils rejetés */}
              {(() => {
                const rejects = profiles.filter(
                  (p) =>
                    (p.profil === "artiste" || p.profil === "artisan") && p.statut === "rejete",
                );
                return rejects.length > 0 ? (
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-muted-foreground">Rejetés</h3>
                    <div className="mt-3 space-y-2">
                      {rejects.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3 opacity-60"
                        >
                          <div>
                            <p className="text-sm font-medium text-forest-deep">
                              {p.prenom} {p.nom}
                            </p>
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                          </div>
                          <Badge variant="outline" className="border-red-200 text-red-600">
                            Rejeté
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </TabsContent>

          {/* ======================== UTILISATEURS ======================== */}
          <TabsContent value="utilisateurs">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-lg text-forest-deep">Utilisateurs</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Modifiez les rôles des utilisateurs.
              </p>

              {loadingProfiles ? (
                <div className="flex justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" />
                </div>
              ) : profiles.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Aucun utilisateur.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {profiles.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-forest-deep">
                          {p.prenom} {p.nom}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Inscrit le {new Date(p.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={p.profil === "admin" ? "default" : "quiet"}>
                          {p.profil}
                        </Badge>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
