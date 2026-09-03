import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Palette as PaletteIcon,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Star,
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
import { useAdminSites, useAdminCreateSite, useAdminUpdateSite, useAdminDeleteSite } from "@/hooks/use-data";
import { requireRole } from "@/lib/auth-guard";
import type { Site } from "@/hooks/use-data";

export const Route = createFileRoute("/admin/sites")({
  beforeLoad: () => requireRole(["admin"]),
  head: () => ({
    meta: [
      { title: "Gestion des sites — DanXomè" },
      { name: "description", content: "Gestion des sites touristiques du Bénin." },
    ],
  }),
  component: SitesAdmin,
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

const typesSite = ["Historique", "Naturel", "Culturel", "Religieux", "Lacustre", "Plage", "Parc"];
const regions = ["Atlantique", "Borgou", "Collines", "Couffo", "Donga", "Littoral", "Mono", "Ouémé", "Plateau", "Zou"];

const emptySite = {
  slug: "",
  nom: "",
  region: "",
  type: "",
  prix: 0,
  image_url: "",
  resume: "",
  coords_x: 0,
  coords_y: 0,
  virtuel: false,
};

function SitesAdmin() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Site | null>(null);
  const [form, setForm] = useState(emptySite);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth/login", search: { from: undefined } });
    if (!loading && profile && profile.profil !== "admin") navigate({ to: "/profil" });
  }, [loading, user, profile, navigate]);

  const { data: sites = [], isLoading } = useAdminSites();
  const createSite = useAdminCreateSite();
  const updateSite = useAdminUpdateSite();
  const deleteSite = useAdminDeleteSite();

  const openCreate = () => { setEditingItem(null); setForm(emptySite); setDialogOpen(true); };

  const openEdit = (s: Site) => {
    setEditingItem(s);
    setForm({ slug: s.slug, nom: s.nom, region: s.region, type: s.type, prix: s.prix, image_url: s.image_url, resume: s.resume, coords_x: s.coords_x, coords_y: s.coords_y, virtuel: s.virtuel });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await updateSite.mutateAsync({ id: editingItem.id, ...form });
        showFeedback("success", "Site modifié.");
      } else {
        await createSite.mutateAsync(form);
        showFeedback("success", "Site créé.");
      }
      setDialogOpen(false);
    } catch {
      showFeedback("error", "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id: string, nom: string) => {
    if (!confirm(`Supprimer le site « ${nom} » ?`)) return;
    try {
      await deleteSite.mutateAsync(id);
      showFeedback("success", "Site supprimé.");
    } catch {
      showFeedback("error", "Erreur lors de la suppression.");
    }
  };

  const filtered = sites.filter((s) => s.nom?.toLowerCase().includes(search.toLowerCase()) || s.region?.toLowerCase().includes(search.toLowerCase()));

  if (loading || !profile || profile.profil !== "admin") {
    return <div className="flex min-h-screen items-center justify-center"><div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" /></div>;
  }

  return (
    <DashboardShell space="Administration" items={navItems} title="Gestion des sites touristiques" crumbs={[{ label: "Administration", to: "/admin" }, { label: "Sites" }]}
      actions={<div className="flex gap-2"><Button asChild variant="ghost" size="sm"><Link to="/admin"><ArrowLeft className="mr-1 size-4" /> Retour</Link></Button><Button variant="gold" size="sm" onClick={openCreate}><Plus className="mr-1 size-4" /> Ajouter</Button></div>}>
      <div className="space-y-6">
        {feedback && <div className={`rounded-lg border px-4 py-3 text-sm ${feedback.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{feedback.message}</div>}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-forest/10 text-forest"><MapPin className="size-4" /></div><div><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-semibold text-forest-deep">{sites.length}</p></div></div></div>
          <div className="rounded-lg border border-border bg-card p-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Eye className="size-4" /></div><div><p className="text-xs text-muted-foreground">Avec visite virtuelle</p><p className="text-2xl font-semibold text-forest-deep">{sites.filter((s) => s.virtuel).length}</p></div></div></div>
          <div className="rounded-lg border border-border bg-card p-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-600"><Star className="size-4" /></div><div><p className="text-xs text-muted-foreground">Note moyenne</p><p className="text-2xl font-semibold text-forest-deep">{sites.length > 0 ? (sites.reduce((sum, s) => sum + (s.note ?? 0), 0) / sites.length).toFixed(1) : "—"}</p></div></div></div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-forest-deep">Catalogue des sites</h2>
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" /></div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Aucun site.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {filtered.map((s) => (
                <div key={s.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img src={s.image_url} alt={s.nom} className="size-12 rounded-md object-cover" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-forest-deep">{s.nom}</p>
                        {s.virtuel && <Badge variant="outline" className="border-blue-300 text-blue-700">360°</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{s.region} · {s.type} · {s.prix > 0 ? `${s.prix} FCFA` : "Gratuit"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm"><Star className="size-3.5 fill-amber-400 text-amber-400" /><span className="font-medium text-forest-deep">{s.note?.toFixed(1) ?? "—"}</span><span className="text-xs text-muted-foreground">({s.avis_count})</span></div>
                    <Button asChild variant="outline" size="sm"><Link to="/tourisme/sites/$slug" params={{ slug: s.slug }}>Voir</Link></Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(s)}><Pencil className="size-4" /></Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(s.id, s.nom)} disabled={deleteSite.isPending}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier le site" : "Nouveau site"}</DialogTitle>
            <DialogDescription>{editingItem ? "Modifiez les champs puis enregistrez." : "Remplissez les champs pour créer un site touristique."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Nom</Label>
              <Input className="mt-1.5" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value, slug: e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} />
            </div>
            <div>
              <Label>Région</Label>
              <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>{regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>{typesSite.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prix (FCFA, 0 = gratuit)</Label>
              <Input className="mt-1.5" type="number" value={form.prix || ""} onChange={(e) => setForm({ ...form, prix: Number(e.target.value) })} />
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label>Coordonnées X</Label>
                <Input className="mt-1.5" type="number" step="0.01" value={form.coords_x || ""} onChange={(e) => setForm({ ...form, coords_x: Number(e.target.value) })} />
              </div>
              <div className="flex-1">
                <Label>Coordonnées Y</Label>
                <Input className="mt-1.5" type="number" step="0.01" value={form.coords_y || ""} onChange={(e) => setForm({ ...form, coords_y: Number(e.target.value) })} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>URL image</Label>
              <Input className="mt-1.5" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Résumé</Label>
              <Textarea className="mt-1.5" rows={3} value={form.resume} onChange={(e) => setForm({ ...form, resume: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="virtuel" checked={form.virtuel} onChange={(e) => setForm({ ...form, virtuel: e.target.checked })} className="size-4 rounded border-gray-300" />
              <Label htmlFor="virtuel">Visite virtuelle 360°</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button variant="gold" onClick={handleSubmit} disabled={createSite.isPending || updateSite.isPending}>
              {createSite.isPending || updateSite.isPending ? "Enregistrement..." : editingItem ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
