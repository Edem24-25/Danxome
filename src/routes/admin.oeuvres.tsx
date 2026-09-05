import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  LayoutDashboard,
  MessageSquare,
  Package,
  Palette as PaletteIcon,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth";
import {
  useAdminOeuvres,
  useAdminCreateOeuvre,
  useAdminUpdateOeuvre,
  useAdminDeleteOeuvre,
  useArtistes,
  formatFcfa,
} from "@/hooks/use-data";
import { requireRole } from "@/lib/auth-guard";
import type { Oeuvre } from "@/hooks/use-data";

export const Route = createFileRoute("/admin/oeuvres")({
  beforeLoad: () => requireRole(["admin"]),
  head: () => ({
    meta: [
      { title: "Gestion des œuvres — DanXomè" },
      { name: "description", content: "Modération et gestion des œuvres d'art." },
    ],
  }),
  component: OeuvresAdmin,
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

const categories = [
  "Sculpture",
  "Peinture",
  "Bronze",
  "Tenture",
  "Poterie",
  "Textile",
  "Bijoux",
  "Autre",
];
const regions = [
  "Atlantique",
  "Borgou",
  "Collines",
  "Couffo",
  "Donga",
  "Littoral",
  "Mono",
  "Ouémé",
  "Plateau",
  "Zou",
];

const emptyOeuvre: {
  slug: string;
  titre: string;
  artiste_id: string;
  categorie: string;
  region: string;
  prix: number;
  image_url: string;
  description: string;
  statut: "publiee" | "brouillon";
} = {
  slug: "",
  titre: "",
  artiste_id: "",
  categorie: "",
  region: "",
  prix: 0,
  image_url: "",
  description: "",
  statut: "brouillon",
};

function OeuvresAdmin() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState<string>("tous");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Oeuvre | null>(null);
  const [form, setForm] = useState(emptyOeuvre);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth/login", search: { from: undefined } });
    if (!loading && profile && profile.profil !== "admin") navigate({ to: "/profil" });
  }, [loading, user, profile, navigate]);

  const { data: oeuvres = [], isLoading } = useAdminOeuvres();
  const { data: artistes = [] } = useArtistes();
  const createOeuvre = useAdminCreateOeuvre();
  const updateOeuvre = useAdminUpdateOeuvre();
  const deleteOeuvre = useAdminDeleteOeuvre();

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyOeuvre);
    setDialogOpen(true);
  };

  const openEdit = (o: Oeuvre) => {
    setEditingItem(o);
    setForm({
      slug: o.slug,
      titre: o.titre,
      artiste_id: o.artiste_id,
      categorie: o.categorie,
      region: o.region,
      prix: o.prix,
      image_url: o.image_url,
      description: o.description,
      statut: o.statut,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await updateOeuvre.mutateAsync({ id: editingItem.id, ...form });
        showFeedback("success", "Œuvre modifiée.");
      } else {
        await createOeuvre.mutateAsync(form);
        showFeedback("success", "Œuvre créée.");
      }
      setDialogOpen(false);
    } catch {
      showFeedback("error", "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id: string, titre: string) => {
    if (!confirm(`Supprimer « ${titre} » définitivement ?`)) return;
    try {
      await deleteOeuvre.mutateAsync(id);
      showFeedback("success", "Œuvre supprimée.");
    } catch {
      showFeedback("error", "Erreur lors de la suppression.");
    }
  };

  const handleUpdateStatut = async (id: string, statut: "publiee" | "brouillon") => {
    try {
      await updateOeuvre.mutateAsync({ id, statut });
      showFeedback("success", "Statut mis à jour.");
    } catch {
      showFeedback("error", "Erreur lors de la mise à jour.");
    }
  };

  const filtered = oeuvres.filter((o) => {
    const matchSearch =
      o.titre?.toLowerCase().includes(search.toLowerCase()) ||
      o.artiste?.nom?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "tous" || o.statut === filterStatut;
    return matchSearch && matchStatut;
  });

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
      title="Gestion des œuvres"
      crumbs={[{ label: "Administration", to: "/admin" }, { label: "Œuvres" }]}
      actions={
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin">
              <ArrowLeft className="mr-1 size-4" /> Retour
            </Link>
          </Button>
          <Button variant="gold" size="sm" onClick={openCreate}>
            <Plus className="mr-1 size-4" /> Ajouter
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {feedback && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${feedback.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold text-forest-deep">{oeuvres.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Publiées</p>
            <p className="text-2xl font-semibold text-green-600">
              {oeuvres.filter((o) => o.statut === "publiee").length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Brouillons</p>
            <p className="text-2xl font-semibold text-amber-600">
              {oeuvres.filter((o) => o.statut === "brouillon").length}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg text-forest-deep">Catalogue complet</h2>
            <div className="flex gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous</SelectItem>
                  <SelectItem value="publiee">Publiées</SelectItem>
                  <SelectItem value="brouillon">Brouillons</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Aucune œuvre.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {filtered.map((o) => (
                <div
                  key={o.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={o.image_url}
                      alt={o.titre}
                      className="size-12 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-forest-deep">{o.titre}</p>
                        <Badge variant={o.statut === "publiee" ? "default" : "outline"}>
                          {o.statut === "publiee" ? "Publiée" : "Brouillon"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {o.artiste?.nom ?? "Inconnu"} · {formatFcfa(o.prix)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={o.statut}
                      onValueChange={(v) => handleUpdateStatut(o.id, v as "publiee" | "brouillon")}
                      disabled={updateOeuvre.isPending}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="publiee">Publiée</SelectItem>
                        <SelectItem value="brouillon">Brouillon</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => openEdit(o)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDelete(o.id, o.titre)}
                      disabled={deleteOeuvre.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog Create / Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier l'œuvre" : "Nouvelle œuvre"}</DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Modifiez les champs puis enregistrez."
                : "Remplissez les champs pour créer une œuvre."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Titre</Label>
              <Input
                className="mt-1.5"
                value={form.titre}
                onChange={(e) =>
                  setForm({
                    ...form,
                    titre: e.target.value,
                    slug: e.target.value
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/(^-|-$)/g, ""),
                  })
                }
              />
            </div>
            <div>
              <Label>Artiste</Label>
              <Select
                value={form.artiste_id}
                onValueChange={(v) => setForm({ ...form, artiste_id: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {artistes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select
                value={form.categorie}
                onValueChange={(v) => setForm({ ...form, categorie: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Région</Label>
              <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prix (FCFA)</Label>
              <Input
                className="mt-1.5"
                type="number"
                value={form.prix || ""}
                onChange={(e) => setForm({ ...form, prix: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>URL image</Label>
              <Input
                className="mt-1.5"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                className="mt-1.5"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Statut</Label>
              <Select
                value={form.statut}
                onValueChange={(v) => setForm({ ...form, statut: v as "publiee" | "brouillon" })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publiee">Publiée</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="gold"
              onClick={handleSubmit}
              disabled={createOeuvre.isPending || updateOeuvre.isPending}
            >
              {createOeuvre.isPending || updateOeuvre.isPending
                ? "Enregistrement..."
                : editingItem
                  ? "Enregistrer"
                  : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
