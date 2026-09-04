import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { FileText, Upload, Trash2, File, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/site/DashboardShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth";
import {
  LayoutDashboard,
  Image,
  Package,
  Wallet,
  UserRound,
} from "lucide-react";
import {
  useMesDocuments,
  useUploadDocument,
  useDeleteDocument,
  getSignedDocumentUrl,
} from "@/hooks/use-data";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/artiste/justificatifs")({
  beforeLoad: async () => {
    await requireRole(["artiste", "artisan"]);
  },
  head: () => ({
    meta: [
      { title: "Justificatifs — DanXomè" },
      {
        name: "description",
        content: "Gérez vos justificatifs professionnels pour la vérification de votre profil.",
      },
    ],
  }),
  component: JustificatifsPage,
});

const navItems = [
  { to: "/artiste", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/artiste/vitrine", label: "Ma vitrine", icon: Image },
  { to: "/artiste/commandes", label: "Commandes", icon: Package },
  { to: "/artiste/justificatifs", label: "Justificatifs", icon: FileText },
  { to: "/contact", label: "Support", icon: Wallet },
  { to: "/profil", label: "Mon profil", icon: UserRound },
];

const DOCUMENT_TYPES = [
  { value: "carte_professionnelle", label: "Carte professionnelle" },
  { value: "justificatif_activite", label: "Justificatif d'activité" },
  { value: "registre_metiers", label: "Inscription au Registre des Métiers" },
  { value: "photo_atelier", label: "Photo de l'atelier" },
  { value: "photo_creation", label: "Photo de création" },
  { value: "autre", label: "Autre justificatif" },
];

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  DOCUMENT_TYPES.map((d) => [d.value, d.label])
);

function DocumentItem({
  doc,
  onDelete,
  isDeleting,
}: {
  doc: { id: string; file_url: string; file_name: string | null; document_type: string; uploaded_at: string };
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [loadingView, setLoadingView] = useState(false);

  const handleView = async () => {
    setLoadingView(true);
    try {
      const url = await getSignedDocumentUrl(doc.file_url);
      window.open(url, "_blank");
    } catch {
      toast.error("Erreur", { description: "Impossible d'ouvrir le document." });
    } finally {
      setLoadingView(false);
    }
  };

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border p-4">
      <File className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-forest-deep">
          {doc.file_name ?? TYPE_LABELS[doc.document_type] ?? doc.document_type}
        </p>
        <p className="text-xs text-muted-foreground">
          {TYPE_LABELS[doc.document_type] ?? doc.document_type} ·{" "}
          {new Date(doc.uploaded_at).toLocaleDateString("fr-FR")}
        </p>
      </div>
      <button
        type="button"
        onClick={handleView}
        disabled={loadingView}
        className="shrink-0 text-xs text-terracotta hover:underline disabled:opacity-50"
      >
        {loadingView ? (
          <div className="size-3.5 animate-spin rounded-full border-2 border-terracotta border-t-transparent" />
        ) : (
          "Voir"
        )}
      </button>
      <button
        type="button"
        className="shrink-0 text-destructive hover:underline"
        onClick={() => onDelete(doc.id)}
        disabled={isDeleting}
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}

function JustificatifsPage() {
  const { profile } = useAuth();
  const estVerifie = profile?.statut === "valide";
  const estEnAttente = profile?.statut === "en_attente";
  const estRejete = profile?.statut === "rejete";
  const estSuspendu = profile?.statut === "suspendu";

  const { data: mesDocuments = [], isLoading } = useMesDocuments();
  const uploadDoc = useUploadDocument();
  const deleteDoc = useDeleteDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("carte_professionnelle");

  return (
    <DashboardShell
      space="Espace Artiste"
      items={navItems}
      title="Justificatifs"
      crumbs={[
        { label: "Artiste", to: "/artiste" },
        { label: "Justificatifs" },
      ]}
    >
      {/* BANNIÈRE STATUT */}
      {estVerifie && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle className="size-5 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold">Profil vérifié</p>
            <p className="text-green-700">
              Votre identité professionnelle a été validée. Vous pouvez publier des œuvres.
            </p>
          </div>
        </div>
      )}
      {estEnAttente && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <Clock className="size-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Vérification en cours</p>
            <p className="text-amber-700">
              Votre dossier est en cours d'examen par notre équipe. Vous serez notifié de la décision.
            </p>
          </div>
        </div>
      )}
      {estRejete && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="size-5 shrink-0 text-red-600" />
          <div>
            <p className="font-semibold">Dossier rejeté</p>
            <p className="text-red-700">
              Votre demande de vérification a été refusée. Veuillez modifier vos informations ou contacter le support.
            </p>
          </div>
        </div>
      )}
      {estSuspendu && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <AlertCircle className="size-5 shrink-0 text-orange-600" />
          <div>
            <p className="font-semibold">Compte suspendu</p>
            <p className="text-orange-700">
              Votre profil professionnel a été suspendu. Contactez le support pour plus d'informations.
            </p>
          </div>
        </div>
      )}

      {/* INSTRUCTIONS */}
      <div className="mb-6 rounded-lg border border-border bg-secondary/30 p-6">
        <h2 className="font-display text-lg font-semibold text-forest-deep">
          Documents à fournir
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pour accélérer la vérification de votre profil, veuillez transmettre les documents suivants :
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-terracotta" />
            <span><strong>Carte professionnelle</strong> ou attestation d'inscription au Répertoire Métier</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-terracotta" />
            <span><strong>Justificatif d'activité</strong> (Kbis, avis d'imposition, etc.)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-terracotta" />
            <span><strong>Photo de l'atelier</strong> ou du lieu de production</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-terracotta" />
            <span><strong>Photos de créations</strong> attestant de votre savoir-faire</span>
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Formats acceptés : images (JPG, PNG, WEBP) et PDF. Taille maximum : 10 Mo par fichier.
        </p>
      </div>

      {/* LISTE DES DOCUMENTS */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-display text-base font-semibold text-forest-deep">
          Documents transmis ({mesDocuments.length})
        </h3>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : mesDocuments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun document transmis pour l'instant.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {mesDocuments.map((doc) => (
              <DocumentItem
                key={doc.id}
                doc={doc}
                onDelete={async (id) => {
                  try {
                    await deleteDoc.mutateAsync(id);
                    toast.success("Document supprimé");
                  } catch {
                    toast.error("Erreur lors de la suppression");
                  }
                }}
                isDeleting={deleteDoc.isPending}
              />
            ))}
          </ul>
        )}

        {/* UPLOAD */}
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm font-medium text-forest-deep">Ajouter un document</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-64"
            >
              {DOCUMENT_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label}
                </option>
              ))}
            </select>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 10 * 1024 * 1024) {
                  toast.error("Fichier trop volumineux", { description: "10 Mo maximum." });
                  return;
                }
                try {
                  await uploadDoc.mutateAsync({
                    file,
                    documentType: docType,
                    fileName: file.name,
                  });
                  toast.success("Document envoyé", { description: `"${file.name}" a été ajouté.` });
                  if (fileInputRef.current) fileInputRef.current.value = "";
                } catch {
                  toast.error("Erreur", { description: "Impossible d'envoyer le document." });
                }
              }}
            />
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadDoc.isPending}
            >
              {uploadDoc.isPending ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Envoi…
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Choisir un fichier
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
