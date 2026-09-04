import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Hammer,
  LayoutDashboard,
  MessageSquare,
  Package,
  Palette as PaletteIcon,
  Search,
  ShieldCheck,
  XCircle,
  AlertCircle,
  ExternalLink,
  MapPin,
  Phone,
  Calendar,
  Award,
  Globe,
  File,
  Download,
} from "lucide-react";
import { DashboardShell } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { useAdminVerifications, useAdminUpdateProfilStatut, useAdminDocuments, getSignedDocumentUrl } from "@/hooks/use-data";
import { requireRole } from "@/lib/auth-guard";
import type { VerificationRequest } from "@/hooks/use-data";

export const Route = createFileRoute("/admin/verifications")({
  beforeLoad: () => requireRole(["admin"]),
  head: () => ({
    meta: [
      { title: "Vérifications professionnelles — DanXomè" },
      {
        name: "description",
        content: "Gestion des vérifications professionnelles des artistes et artisans.",
      },
    ],
  }),
  component: Verifications,
});

const navItems = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: ShieldCheck },
  { to: "/admin/verifications", label: "Vérifications", icon: FileText },
  { to: "/admin/oeuvres", label: "Œuvres", icon: PaletteIcon },
  { to: "/admin/sites", label: "Sites", icon: Eye },
  { to: "/admin/evenements", label: "Événements", icon: MessageSquare },
  { to: "/admin/newsletter", label: "Newsletter", icon: Package },
];

const statutBadge: Record<string, { label: string; variant: "default" | "quiet" | "destructive" | "outline" }> = {
  en_attente: { label: "En attente", variant: "outline" },
  valide: { label: "Vérifié", variant: "quiet" },
  rejete: { label: "Rejeté", variant: "destructive" },
  suspendu: { label: "Suspendu", variant: "destructive" },
};

function Verifications() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { data: verifications = [], isLoading: loadingVerifications } = useAdminVerifications();
  const updateStatut = useAdminUpdateProfilStatut();

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

  const enAttente = verifications.filter((v) => v.statut === "en_attente");
  const verifies = verifications.filter((v) => v.statut === "valide");
  const rejetes = verifications.filter((v) => v.statut === "rejete");
  const suspendus = verifications.filter((v) => v.statut === "suspendu");

  const filtered = verifications.filter(
    (v) =>
      v.prenom?.toLowerCase().includes(search.toLowerCase()) ||
      v.nom?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const openDetail = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setRejectReason("");
    setDetailOpen(true);
  };

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await updateStatut.mutateAsync({ id, statut: "valide" });
      showFeedback("success", "Profil vérifié avec succès.");
      setDetailOpen(false);
      setSelectedRequest(null);
    } catch {
      showFeedback("error", "Erreur lors de la validation.");
    }
    setActionLoading(false);
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      showFeedback("error", "Veuillez indiquer une raison de rejet.");
      return;
    }
    setActionLoading(true);
    try {
      await updateStatut.mutateAsync({ id, statut: "rejete", rejection_reason: rejectReason });
      showFeedback("success", "Profil rejeté.");
      setDetailOpen(false);
      setSelectedRequest(null);
    } catch {
      showFeedback("error", "Erreur lors du rejet.");
    }
    setActionLoading(false);
  };

  const handleSuspend = async (id: string) => {
    setActionLoading(true);
    try {
      await updateStatut.mutateAsync({ id, statut: "suspendu" });
      showFeedback("success", "Profil suspendu.");
      setDetailOpen(false);
      setSelectedRequest(null);
    } catch {
      showFeedback("error", "Erreur lors de la suspension.");
    }
    setActionLoading(false);
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
      title="Vérifications professionnelles"
      crumbs={[{ label: "Administration", to: "/admin" }, { label: "Vérifications" }]}
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

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold text-forest-deep">{verifications.length}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-amber-700">En attente</p>
            <p className="text-2xl font-semibold text-amber-800">{enAttente.length}</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-xs text-green-700">Vérifiés</p>
            <p className="text-2xl font-semibold text-green-800">{verifies.length}</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs text-red-700">Rejetés / Suspendus</p>
            <p className="text-2xl font-semibold text-red-800">
              {rejetes.length + suspendus.length}
            </p>
          </div>
        </div>

        <Tabs defaultValue="attente">
          <TabsList>
            <TabsTrigger value="attente" className="gap-1.5">
              <Clock className="size-3.5" /> En attente ({enAttente.length})
            </TabsTrigger>
            <TabsTrigger value="verifies" className="gap-1.5">
              <CheckCircle className="size-3.5" /> Vérifiés ({verifies.length})
            </TabsTrigger>
            <TabsTrigger value="rejetes" className="gap-1.5">
              <XCircle className="size-3.5" /> Rejetés ({rejetes.length})
            </TabsTrigger>
            <TabsTrigger value="tous" className="gap-1.5">
              <ShieldCheck className="size-3.5" /> Tous ({verifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attente">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-lg text-forest-deep">
                Demandes en attente de vérification
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Consultez et traitez les dossiers des artistes et artisans.
              </p>

              {enAttente.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle className="mx-auto size-10 text-green-500" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Aucune demande en attente. Tout est à jour !
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {enAttente.map((v) => (
                    <VerificationCard key={v.id} request={v} onView={() => openDetail(v)} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="verifies">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-lg text-forest-deep">Professionnels vérifiés</h2>
              <div className="mt-6 space-y-4">
                {verifies.map((v) => (
                  <VerificationCard key={v.id} request={v} onView={() => openDetail(v)} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rejetes">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-lg text-forest-deep">Rejetés / Suspendus</h2>
              <div className="mt-6 space-y-4">
                {[...rejetes, ...suspendus].map((v) => (
                  <VerificationCard key={v.id} request={v} onView={() => openDetail(v)} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tous">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg text-forest-deep">Tous les professionnels</h2>
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

              {loadingVerifications ? (
                <div className="flex justify-center py-12">
                  <div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Aucun professionnel trouvé.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {filtered.map((v) => (
                    <VerificationCard key={v.id} request={v} onView={() => openDetail(v)} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══ DIALOGUE DÉTAIL ═══ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dossier de vérification</DialogTitle>
            <DialogDescription>
              Consultez les informations du professionnel et prenez une décision.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* En-tête */}
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full bg-forest/10 font-display text-2xl text-forest">
                  {selectedRequest.prenom[0]}
                  {selectedRequest.nom[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg text-forest-deep">
                      {selectedRequest.prenom} {selectedRequest.nom}
                    </h3>
                    <Badge variant={statutBadge[selectedRequest.statut]?.variant ?? "default"}>
                      {statutBadge[selectedRequest.statut]?.label ?? selectedRequest.statut}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                </div>
              </div>

              {/* Infos principales */}
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={<PaletteIcon className="size-3.5" />}
                  label="Type"
                  value={selectedRequest.profil === "artiste" ? "Artiste" : "Artisan"}
                />
                <InfoItem
                  icon={<Award className="size-3.5" />}
                  label={selectedRequest.profil === "artiste" ? "Nom artistique" : "Nom commercial"}
                  value={selectedRequest.nom_artiste || "Non renseigné"}
                />
                <InfoItem
                  icon={<FileText className="size-3.5" />}
                  label="Spécialité"
                  value={selectedRequest.categorie || selectedRequest.metier || "Non renseigné"}
                />
                <InfoItem
                  icon={<MapPin className="size-3.5" />}
                  label="Ville"
                  value={selectedRequest.ville || "Non renseigné"}
                />
                <InfoItem
                  icon={<Phone className="size-3.5" />}
                  label="Téléphone"
                  value={selectedRequest.telephone || "Non renseigné"}
                />
                <InfoItem
                  icon={<Calendar className="size-3.5" />}
                  label="Inscrit le"
                  value={new Date(selectedRequest.created_at).toLocaleDateString("fr-FR")}
                />
                {selectedRequest.annees_experience && (
                  <InfoItem
                    icon={<Award className="size-3.5" />}
                    label="Années d'expérience"
                    value={`${selectedRequest.annees_experience} ans`}
                  />
                )}
                {selectedRequest.website_url && (
                  <InfoItem
                    icon={<Globe className="size-3.5" />}
                    label="Site web"
                    value={
                      <a
                        href={selectedRequest.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terracotta hover:underline flex items-center gap-1"
                      >
                        {selectedRequest.website_url}
                        <ExternalLink className="size-3" />
                      </a>
                    }
                  />
                )}
              </div>

              {/* Bio */}
              {selectedRequest.bio && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Description
                  </p>
                  <p className="mt-1 text-sm text-forest-deep whitespace-pre-wrap">
                    {selectedRequest.bio}
                  </p>
                </div>
              )}

              {/* Réseaux sociaux */}
              {Object.keys(selectedRequest.social_links).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Réseaux sociaux
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(selectedRequest.social_links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-forest hover:bg-secondary/50"
                      >
                        {platform}
                        <ExternalLink className="size-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {selectedRequest.portfolio_url && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Portfolio
                  </p>
                  <a
                    href={selectedRequest.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm text-terracotta hover:underline"
                  >
                    {selectedRequest.portfolio_url}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}

              {/* Justificatifs */}
              <DocumentsSection userId={selectedRequest.id} />

              {/* Zone d'action */}
              {(selectedRequest.statut === "en_attente" || selectedRequest.statut === "valide" || selectedRequest.statut === "suspendu") && (
                <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
                  {selectedRequest.statut === "en_attente" && (
                    <div className="space-y-2">
                      <Label htmlFor="reject-reason" className="text-sm font-medium text-forest-deep">
                        Raison du rejet{" "}
                        <span className="text-xs text-muted-foreground">(requis pour rejeter)</span>
                      </Label>
                      <Textarea
                        id="reject-reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Indiquez la raison du rejet..."
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.statut === "en_attente" && (
                      <>
                        <Button
                          variant="outline"
                          className="gap-1.5 border-green-300 text-green-700 hover:bg-green-100"
                          onClick={() => handleApprove(selectedRequest.id)}
                          disabled={actionLoading}
                        >
                          <CheckCircle className="size-4" />
                          Approuver
                        </Button>
                        <Button
                          variant="outline"
                          className="gap-1.5 border-red-300 text-red-700 hover:bg-red-100"
                          onClick={() => handleReject(selectedRequest.id)}
                          disabled={actionLoading}
                        >
                          <XCircle className="size-4" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    {selectedRequest.statut === "valide" && (
                      <Button
                        variant="outline"
                        className="gap-1.5 border-orange-300 text-orange-700 hover:bg-orange-100"
                        onClick={() => handleSuspend(selectedRequest.id)}
                        disabled={actionLoading}
                      >
                        <AlertCircle className="size-4" />
                        Suspendre
                      </Button>
                    )}
                    {selectedRequest.statut === "suspendu" && (
                      <Button
                        variant="outline"
                        className="gap-1.5 border-green-300 text-green-700 hover:bg-green-100"
                        onClick={() => handleApprove(selectedRequest.id)}
                        disabled={actionLoading}
                      >
                        <CheckCircle className="size-4" />
                        Réactiver
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDetailOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

function VerificationCard({
  request,
  onView,
}: {
  request: VerificationRequest;
  onView: () => void;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
        request.statut === "en_attente"
          ? "border-amber-200 bg-amber-50"
          : request.statut === "valide"
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-forest-deep">
            {request.prenom} {request.nom}
          </p>
          <Badge variant={statutBadge[request.statut]?.variant ?? "default"}>
            {statutBadge[request.statut]?.label ?? request.statut}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{request.email}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {request.profil === "artiste" ? (
              <PaletteIcon className="size-3" />
            ) : (
              <Hammer className="size-3" />
            )}
            {request.profil === "artiste" ? "Artiste" : "Artisan"}
          </span>
          {request.categorie && <span>· {request.categorie}</span>}
          {request.ville && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" /> {request.ville}
            </span>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onView} className="gap-1.5">
        <Eye className="size-3.5" /> Consulter
      </Button>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        {icon} {label}
      </dt>
      <dd className="mt-0.5 text-sm text-forest-deep">{value}</dd>
    </div>
  );
}

function DocumentsSection({ userId }: { userId: string }) {
  const { data: documents = [], isLoading } = useAdminDocuments(userId);

  if (isLoading) {
    return (
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Justificatifs
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="size-3 animate-spin rounded-full border-2 border-forest border-t-transparent" />
          Chargement…
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Justificatifs
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Aucun justificatif transmis.
        </p>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    carte_professionnelle: "Carte professionnelle",
    justificatif_activite: "Justificatif d'activité",
    registre_metiers: "Registre des Métiers",
    photo_atelier: "Photo de l'atelier",
    photo_creation: "Photo de création",
    autre: "Autre",
  };

  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Justificatifs ({documents.length})
      </p>
      <ul className="mt-2 space-y-2">
        {documents.map((doc) => (
          <DocumentItem key={doc.id} doc={doc} typeLabels={typeLabels} />
        ))}
      </ul>
    </div>
  );
}

function DocumentItem({
  doc,
  typeLabels,
}: {
  doc: { id: string; file_url: string; file_name: string | null; document_type: string; uploaded_at: string };
  typeLabels: Record<string, string>;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);

  const handleDownload = async () => {
    if (signedUrl) {
      window.open(signedUrl, "_blank");
      return;
    }
    setLoadingUrl(true);
    try {
      const url = await getSignedDocumentUrl(doc.file_url);
      setSignedUrl(url);
      window.open(url, "_blank");
    } catch {
      toast.error("Erreur", { description: "Impossible de générer le lien de téléchargement." });
    } finally {
      setLoadingUrl(false);
    }
  };

  return (
    <li className="flex items-center gap-3 rounded-md border border-border p-3 text-xs">
      <File className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-forest-deep">
          {doc.file_name ?? typeLabels[doc.document_type] ?? doc.document_type}
        </p>
        <p className="text-muted-foreground">
          {typeLabels[doc.document_type] ?? doc.document_type} ·{" "}
          {new Date(doc.uploaded_at).toLocaleDateString("fr-FR")}
        </p>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loadingUrl}
        className="shrink-0 text-terracotta hover:underline disabled:opacity-50"
      >
        {loadingUrl ? (
          <div className="size-3.5 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
        ) : (
          <Download className="size-3.5" />
        )}
      </button>
    </li>
  );
}
