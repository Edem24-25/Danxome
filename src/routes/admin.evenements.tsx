import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
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
import { useAdminEvenements, useAdminCreateEvenement, useAdminUpdateEvenement, useAdminDeleteEvenement } from "@/hooks/use-data";
import { requireRole } from "@/lib/auth-guard";
import type { Evenement } from "@/hooks/use-data";

export const Route = createFileRoute("/admin/evenements")({
  beforeLoad: () => requireRole(["admin"]),
  head: () => ({
    meta: [
      { title: "Gestion des événements — DanXomè" },
      { name: "description", content: "Gestion des événements culturels du Bénin." },
    ],
  }),
  component: EvenementsAdmin,
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

const categories = ["Festival", "Cérémonie", "Exposition", "Conférence", "Concert", "Marché", "Atelier", "Autre"];
const moisList = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const emptyEvent = {
  slug: "",
  titre: "",
  date: "",
  jour: 1,
  mois: "",
  lieu: "",
  categorie: "",
  image_url: "",
  resume: "",
};

function EvenementsAdmin() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Evenement | null>(null);
  const [form, setForm] = useState(emptyEvent);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth/login", search: { from: undefined } });
    if (!loading && profile && profile.profil !== "admin") navigate({ to: "/profil" });
  }, [loading, user, profile, navigate]);

  const { data: evenements = [], isLoading } = useAdminEvenements();
  const createEvenement = useAdminCreateEvenement();
  const updateEvenement = useAdminUpdateEvenement();
  const deleteEvenement = useAdminDeleteEvenement();

  const openCreate = () => { setEditingItem(null); setForm(emptyEvent); setDialogOpen(true); };

  const openEdit = (e: Evenement) => {
    setEditingItem(e);
    setForm({ slug: e.slug, titre: e.titre, date: e.date, jour: e.jour, mois: e.mois, lieu: e.lieu, categorie: e.categorie, image_url: e.image_url, resume: e.resume });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await updateEvenement.mutateAsync({ id: editingItem.id, ...form });
        showFeedback("success", "Événement modifié.");
      } else {
        await createEvenement.mutateAsync(form);
        showFeedback("success", "Événement créé.");
      }
      setDialogOpen(false);
    } catch {
      showFeedback("error", "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id: string, titre: string) => {
    if (!confirm(`Supprimer l'événement « ${titre} » ?`)) return;
    try {
      await deleteEvenement.mutateAsync(id);
      showFeedback("success", "Événement supprimé.");
    } catch {
      showFeedback("error", "Erreur lors de la suppression.");
    }
  };

  const filtered = evenements.filter((e) => e.titre?.toLowerCase().includes(search.toLowerCase()) || e.lieu?.toLowerCase().includes(search.toLowerCase()) || e.categorie?.toLowerCase().includes(search.toLowerCase()));

  const now = new Date();
  const upcoming = filtered.filter((e) => new Date(e.date) >= now);
  const past = filtered.filter((e) => new Date(e.date) < now);

  if (loading || !profile || profile.profil !== "admin") {
    return <div className="flex min-h-screen items-center justify-center"><div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" /></div>;
  }

  return (
    <DashboardShell space="Administration" items={navItems} title="Gestion des événements" crumbs={[{ label: "Administration", to: "/admin" }, { label: "Événements" }]}
      actions={<div className="flex gap-2"><Button asChild variant="ghost" size="sm"><Link to="/admin"><ArrowLeft className="mr-1 size-4" /> Retour</Link></Button><Button variant="gold" size="sm" onClick={openCreate}><Plus className="mr-1 size-4" /> Ajouter</Button></div>}>
      <div className="space-y-6">
        {feedback && <div className={`rounded-lg border px-4 py-3 text-sm ${feedback.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>{feedback.message}</div>}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-forest/10 text-forest"><CalendarDays className="size-4" /></div><div><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-semibold text-forest-deep">{evenements.length}</p></div></div></div>
          <div className="rounded-lg border border-border bg-card p-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-green-100 text-green-600"><CalendarDays className="size-4" /></div><div><p className="text-xs text-muted-foreground">À venir</p><p className="text-2xl font-semibold text-forest-deep">{upcoming.length}</p></div></div></div>
          <div className="rounded-lg border border-border bg-card p-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground"><CalendarDays className="size-4" /></div><div><p className="text-xs text-muted-foreground">Passés</p><p className="text-2xl font-semibold text-forest-deep">{past.length}</p></div></div></div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-forest-deep">Tous les événements</h2>
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="size-6 animate-spin rounded-full border-2 border-forest border-t-transparent" /></div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Aucun événement.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {filtered.map((e) => {
                const isPast = new Date(e.date) < now;
                return (
                  <div key={e.id} className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${isPast ? "border-border opacity-60" : "border-border"}`}>
                    <div className="flex items-center gap-4">
                      <img src={e.image_url} alt={e.titre} className="size-12 rounded-md object-cover" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-forest-deep">{e.titre}</p>
                          <Badge variant={isPast ? "outline" : "default"}>{isPast ? "Passé" : "À venir"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{e.lieu} · {e.categorie}</p>
                        <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm"><Link to="/evenements/$slug" params={{ slug: e.slug }}>Voir</Link></Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(e)}><Pencil className="size-4" /></Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(e.id, e.titre)} disabled={deleteEvenement.isPending}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Modifier l'événement" : "Nouvel événement"}</DialogTitle>
            <DialogDescription>{editingItem ? "Modifiez les champs puis enregistrez." : "Remplissez les champs pour créer un événement."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Titre</Label>
              <Input className="mt-1.5" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value, slug: e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} />
            </div>
            <div>
              <Label>Date</Label>
              <Input className="mt-1.5" type="date" value={form.date} onChange={(e) => {
                const d = new Date(e.target.value);
                const monthIndex = d.getMonth();
                setForm({ ...form, date: e.target.value, jour: d.getDate(), mois: moisList[monthIndex] ?? "" });
              }} />
            </div>
            <div>
              <Label>Catégorie</Label>
              <Select value={form.categorie} onValueChange={(v) => setForm({ ...form, categorie: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Lieu</Label>
              <Input className="mt-1.5" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>URL image</Label>
              <Input className="mt-1.5" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Résumé</Label>
              <Textarea className="mt-1.5" rows={3} value={form.resume} onChange={(e) => setForm({ ...form, resume: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button variant="gold" onClick={handleSubmit} disabled={createEvenement.isPending || updateEvenement.isPending}>
              {createEvenement.isPending || updateEvenement.isPending ? "Enregistrement..." : editingItem ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
