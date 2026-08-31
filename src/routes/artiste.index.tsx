import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Image, LayoutDashboard, Package, Plus, TrendingUp, UserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/site/DashboardShell";
import { SectionTitle, StatCard } from "@/components/site/Bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  useAddOeuvre,
  useMesOeuvres,
  formatFcfa,
  statutLabel,
  useCommandes,
} from "@/hooks/use-data";
import { useAuth } from "@/contexts/auth";
import { requireRole } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/artiste/")({
  beforeLoad: () => requireRole(["artiste", "artisan", "admin"]),
  head: () => ({
    meta: [
      { title: "Espace artiste — DanXomè" },
      {
        name: "description",
        content:
          "Gérez vos œuvres, vos commandes et vos revenus d'artisan partenaire sur la plateforme DanXomè.",
      },
      { property: "og:title", content: "Espace artiste — DanXomè" },
      {
        property: "og:description",
        content: "Catalogue, commandes et revenus des artisans béninois.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EspaceArtiste,
});

const items = [
  { to: "/artiste", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/artiste/vitrine", label: "Ma vitrine", icon: Image },
  { to: "/artiste/commandes", label: "Commandes", icon: Package },
  { to: "/contact", label: "Support", icon: Wallet },
  { to: "/profil", label: "Mon profil", icon: UserRound },
];

const categories = ["Sculpture", "Textile", "Bronze", "Peinture", "Céramique", "Vannerie"];

const versements = [
  { mois: "Mars 2026", montant: 128000, statut: "Payé" },
  { mois: "Février 2026", montant: 142000, statut: "Payé" },
  { mois: "Janvier 2026", montant: 97000, statut: "Payé" },
  { mois: "Décembre 2025", montant: 45000, statut: "Payé" },
];

const IMAGE_PAR_DEFAUT = "/art-bronze.jpg";

function EspaceArtiste() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [detailOuvert, setDetailOuvert] = useState(false);
  const [categorie, setCategorie] = useState("Sculpture");
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: mesOeuvres, isLoading: loadingOeuvres } = useMesOeuvres();
  const addOeuvre = useAddOeuvre();
  const { data: commandes = [] } = useCommandes();

  const publiees = (mesOeuvres ?? []).filter((o) => o.statut === "publiee");

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth/login", search: { from: undefined } });
    } else if (!loading && profile && profile.profil === "visiteur") {
      navigate({ to: "/profil" });
    }
  }, [loading, user, profile, navigate]);

  if (loading || !profile || loadingOeuvres) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-4xl space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-8 w-24" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border">
            <div className="border-b border-border p-4">
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-border py-3 last:border-0"
                >
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nomAtelier = `${profile.prenom} ${profile.nom}`;
  const revenus = publiees.reduce((s, o) => s + o.prix, 0);

  const ajouterOeuvre = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAjoutEnCours(true);
    const form = new FormData(e.currentTarget);
    const titre = (form.get("titre") as string)?.trim();
    if (!titre) {
      setAjoutEnCours(false);
      toast.error("Titre requis", { description: "Donnez un nom à votre œuvre." });
      return;
    }
    const prix = Number(form.get("prix")) || 0;

    let imageUrl = IMAGE_PAR_DEFAUT;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop() ?? "jpg";
      const userId = user?.id ?? profile.id;
      const path = `${userId}/${Date.now()}.${ext}`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("oeuvres")
        .upload(path, imageFile, { contentType: imageFile.type, upsert: true });
      if (uploadError) {
        setAjoutEnCours(false);
        toast.error("Erreur image", { description: "Impossible d'envoyer la photo." });
        return;
      }
      const { data: urlData } = supabase.storage.from("oeuvres").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    addOeuvre.mutate(
      {
        slug: `oeuvre-${Date.now()}`,
        titre,
        artiste_id: profile.id,
        categorie,
        region: (form.get("region") as string)?.trim() || "Zou",
        prix,
        image_url: imageUrl,
        description: (form.get("description") as string)?.trim() || "Nouvelle œuvre publiée.",
        statut: "publiee",
      },
      {
        onSuccess: () => {
          setAjoutOuvert(false);
          setCategorie("Sculpture");
          setImageFile(null);
          setImagePreview(null);
          e.currentTarget.reset();
          setAjoutEnCours(false);
          toast.success("Œuvre publiée", { description: `« ${titre} » est maintenant en ligne.` });
        },
        onError: () => {
          setAjoutEnCours(false);
          toast.error("Erreur", { description: "Impossible de publier l'œuvre." });
        },
      },
    );
  };

  return (
    <DashboardShell
      space="Espace artiste"
      items={items}
      title={nomAtelier}
      crumbs={[{ label: "Espace artiste" }]}
      actions={
        <Button variant="gold" size="sm" onClick={() => setAjoutOuvert(true)}>
          <Plus /> Ajouter une œuvre
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Œuvres en ligne"
          value={String(publiees.length)}
          icon={<Image className="size-4" />}
        />
        <StatCard
          label="Commandes du mois"
          value="12"
          delta="+3 vs mois dernier"
          icon={<Package className="size-4" />}
        />
        <StatCard
          label="Revenus cumulés"
          value={formatFcfa(revenus)}
          icon={<Wallet className="size-4" />}
        />
        <StatCard
          label="Vues de la vitrine"
          value="4 820"
          delta="+18 %"
          icon={<TrendingUp className="size-4" />}
        />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <SectionTitle eyebrow="Catalogue" title="Mes pièces publiées" />
          <ul className="mt-5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {publiees.map((o) => (
              <li key={o.slug} className="flex flex-wrap items-center gap-4 p-4">
                <img
                  src={o.image_url}
                  alt={o.titre}
                  loading="lazy"
                  className="size-16 rounded-md object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/art/oeuvres/$slug"
                    params={{ slug: o.slug }}
                    className="font-semibold text-forest-deep hover:text-terracotta"
                  >
                    {o.titre}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {o.categorie} · {o.region}
                  </p>
                </div>
                <p className="font-display text-lg text-forest-deep">{formatFcfa(o.prix)}</p>
                <Badge variant="quiet">Publiée</Badge>
              </li>
            ))}
          </ul>

          <SectionTitle
            eyebrow="Ventes"
            title="Commandes récentes"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link to="/artiste/commandes">Voir toutes les commandes</Link>
              </Button>
            }
          />
          <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Pièce</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commandes.slice(0, 3).map((c) => (
                  <tr key={c.ref}>
                    <td className="px-4 py-3 font-mono text-xs">{c.ref}</td>
                    <td className="px-4 py-3">{c.client_nom}</td>
                    <td className="px-4 py-3">{c.oeuvre_titre}</td>
                    <td className="px-4 py-3">
                      <Badge variant={c.statut === "livree" ? "quiet" : "default"}>
                        {statutLabel(c.statut)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-secondary/50 p-6">
            <p className="eyebrow">Versements</p>
            <p className="mt-3 font-display text-3xl text-forest-deep">
              {formatFcfa(versements.reduce((s, v) => s + v.montant, 0))}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Prochain virement Mobile Money le 30 du mois.
            </p>
            <Button variant="outline" className="mt-5 w-full" onClick={() => setDetailOuvert(true)}>
              Voir le détail
            </Button>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            <p className="eyebrow">Conseils de vitrine</p>
            <ul className="mt-4 space-y-3">
              <li>Photographiez vos pièces en lumière naturelle, fond neutre.</li>
              <li>Indiquez matériaux, dimensions et durée de réalisation.</li>
              <li>Racontez l'histoire du motif : les acheteurs y sont sensibles.</li>
            </ul>
          </div>
        </aside>
      </div>

      <Dialog open={ajoutOuvert} onOpenChange={setAjoutOuvert}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une œuvre</DialogTitle>
            <DialogDescription>
              Renseignez les informations de votre pièce pour la publier dans votre vitrine.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={ajouterOeuvre}>
            <div className="space-y-2">
              <Label htmlFor="titre">Titre de l'œuvre</Label>
              <Input
                id="titre"
                name="titre"
                required
                maxLength={120}
                placeholder="Masque de l'aube"
              />
            </div>
            <div className="space-y-2">
              <Label>Photo de l'œuvre</Label>
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-terracotta/50 hover:bg-terracotta/5"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="h-32 w-full rounded-md object-cover"
                  />
                ) : (
                  <>
                    <Image className="size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour ajouter une photo
                    </p>
                    <p className="text-xs text-muted-foreground/70">JPG, PNG — max 5 Mo</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Fichier trop volumineux", { description: "5 Mo maximum." });
                    return;
                  }
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
              />
              {imageFile && (
                <button
                  type="button"
                  className="text-xs text-destructive hover:underline"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Supprimer la photo
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={categorie} onValueChange={setCategorie}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir une catégorie" />
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
              <div className="space-y-2">
                <Label htmlFor="prix">Prix (FCFA)</Label>
                <Input
                  id="prix"
                  name="prix"
                  type="number"
                  min={0}
                  step={1000}
                  required
                  placeholder="150000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Région</Label>
              <Input id="region" name="region" maxLength={60} placeholder="Zou" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Matériaux, dimensions, histoire du motif…"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAjoutOuvert(false)}
                disabled={ajoutEnCours}
              >
                Annuler
              </Button>
              <Button variant="gold" type="submit" disabled={ajoutEnCours}>
                {ajoutEnCours ? "Publication…" : "Publier l'œuvre"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOuvert} onOpenChange={setDetailOuvert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Historique des versements</DialogTitle>
            <DialogDescription>
              Vos versements Mobile Money sont effectués le 30 de chaque mois.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Mois</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {versements.map((v) => (
                  <tr key={v.mois}>
                    <td className="px-4 py-3">{v.mois}</td>
                    <td className="px-4 py-3 font-display text-forest-deep">
                      {formatFcfa(v.montant)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="quiet">{v.statut}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDetailOuvert(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
