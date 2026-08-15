import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Image, LayoutDashboard, Package, Plus, TrendingUp, UserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/site/DashboardShell";
import { SectionTitle, StatCard } from "@/components/site/Bits";
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
import { formatFcfa } from "@/lib/data";
import { useAuth } from "@/contexts/auth";
import { statutLabel, useCommandes } from "@/lib/commandes";
import { imageParDefaut, useMesOeuvres } from "@/lib/oeuvres";

export const Route = createFileRoute("/artiste/")({
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

function EspaceArtiste() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [ajoutOuvert, setAjoutOuvert] = useState(false);
  const [detailOuvert, setDetailOuvert] = useState(false);
  const [categorie, setCategorie] = useState("Sculpture");
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const { publiees, ajouter: ajouterOeuvrePersistee } = useMesOeuvres();
  const { commandes } = useCommandes();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth/login" });
    } else if (!loading && profile && profile.profil === "visiteur") {
      navigate({ to: "/profil" });
    }
  }, [loading, user, profile, navigate]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
      </div>
    );
  }

  const nomAtelier = `${profile.prenom} ${profile.nom}`;
  const revenus = publiees.reduce((s, o) => s + o.prix, 0);

  const ajouterOeuvre = (e: React.FormEvent<HTMLFormElement>) => {
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
    ajouterOeuvrePersistee({
      slug: `oeuvre-${Date.now()}`,
      titre,
      artiste: nomAtelier,
      artisteSlug: "kossi-adanou",
      categorie,
      region: (form.get("region") as string)?.trim() || "Zou",
      prix,
      image: imageParDefaut,
      description: (form.get("description") as string)?.trim() || "Nouvelle œuvre publiée.",
    });
    setAjoutOuvert(false);
    setCategorie("Sculpture");
    e.currentTarget.reset();
    setAjoutEnCours(false);
    toast.success("Œuvre publiée", { description: `« ${titre} » est maintenant en ligne.` });
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
                  src={o.image}
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
                    <td className="px-4 py-3">{c.client}</td>
                    <td className="px-4 py-3">{c.piece}</td>
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
