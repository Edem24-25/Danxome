import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Eye,
  EyeOff,
  Image,
  LayoutDashboard,
  Package,
  Plus,
  Trash2,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFcfa } from "@/lib/data";
import { useAuth } from "@/contexts/auth";
import { useMesOeuvres } from "@/lib/oeuvres";

export const Route = createFileRoute("/artiste/vitrine")({
  head: () => ({
    meta: [
      { title: "Ma vitrine — Dãhomè" },
      {
        name: "description",
        content: "Gérez les œuvres exposées dans votre vitrine d'artiste sur Dãhomè.",
      },
      { property: "og:title", content: "Ma vitrine — Dãhomè" },
    ],
  }),
  component: Vitrine,
});

const items = [
  { to: "/artiste", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/artiste/vitrine", label: "Ma vitrine", icon: Image },
  { to: "/artiste/commandes", label: "Commandes", icon: Package },
  { to: "/contact", label: "Support", icon: Wallet },
  { to: "/profil", label: "Mon profil", icon: UserRound },
];

function Vitrine() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const { liste, publiees, pret, changerStatut, retirer } = useMesOeuvres();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth/login" });
    } else if (!loading && profile && profile.profil === "visiteur") {
      navigate({ to: "/profil" });
    }
  }, [loading, user, profile, navigate]);

  if (loading || !profile || !pret) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
      </div>
    );
  }

  const nomAtelier = `${profile.prenom} ${profile.nom}`;

  const basculer = (slug: string, statut: "publiee" | "brouillon") => {
    changerStatut(slug, statut);
    toast.success(statut === "publiee" ? "Œuvre publiée" : "Œuvre masquée", {
      description:
        statut === "publiee"
          ? "Elle est de nouveau visible dans votre vitrine."
          : "Elle n'est plus visible dans votre vitrine.",
    });
  };

  const supprimer = (slug: string, titre: string) => {
    retirer(slug);
    toast.success("Œuvre supprimée", { description: `« ${titre} » a été retirée.` });
  };

  return (
    <DashboardShell
      space="Espace artiste"
      items={items}
      title={`Vitrine de ${nomAtelier}`}
      crumbs={[{ label: "Espace artiste", to: "/artiste" }, { label: "Ma vitrine" }]}
    >
      <p className="text-sm text-muted-foreground">
        {publiees.length} œuvre{publiees.length > 1 ? "s" : ""} publiée
        {publiees.length > 1 ? "s" : ""} · {liste.length - publiees.length} masquée
        {liste.length - publiees.length > 1 ? "s" : ""}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {liste.map((o) => (
          <article
            key={o.slug}
            className="overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
          >
            <div className="relative">
              <img
                src={o.image}
                alt={o.titre}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <Badge
                variant={o.statut === "publiee" ? "default" : "outline"}
                className="absolute top-3 left-3"
              >
                {o.statut === "publiee" ? "Publiée" : "Masquée"}
              </Badge>
            </div>
            <div className="p-4">
              <Link
                to="/art/oeuvres/$slug"
                params={{ slug: o.slug }}
                className="font-semibold text-forest-deep hover:text-terracotta"
              >
                {o.titre}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {o.categorie} · {o.region}
              </p>
              <p className="mt-2 font-display text-lg text-forest-deep">{formatFcfa(o.prix)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => basculer(o.slug, o.statut === "publiee" ? "brouillon" : "publiee")}
                >
                  {o.statut === "publiee" ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                  {o.statut === "publiee" ? "Masquer" : "Publier"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => supprimer(o.slug, o.titre)}
                >
                  <Trash2 className="size-4" /> Retirer
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Une nouvelle pièce est prête à être montrée ?
        </p>
        <Button asChild variant="gold">
          <Link to="/artiste">
            <Plus /> Ajouter une œuvre
          </Link>
        </Button>
      </div>
    </DashboardShell>
  );
}
