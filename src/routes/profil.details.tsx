import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { ProfilShell } from "@/components/site/ProfilShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/profil/details")({
  head: () => ({
    meta: [
      { title: "Mes informations — DanXomè" },
      {
        name: "description",
        content: "Modifiez vos informations personnelles sur DanXomè.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilDetails,
});

function ProfilDetails() {
  const { profile, loading, user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [enCours, setEnCours] = useState(false);
  const [prenom, setPrenom] = useState(profile?.prenom ?? "");
  const [nom, setNom] = useState(profile?.nom ?? "");
  const [telephone, setTelephone] = useState(profile?.telephone ?? "");
  const [adresse, setAdresse] = useState(profile?.adresse ?? "");
  const [ville, setVille] = useState(profile?.ville ?? "");
  const [pays, setPays] = useState(profile?.pays ?? "");

  if (loading || !user || !profile) {
    return (
      <ProfilShell title="Mes informations" crumbs={[{ label: "Mon profil", to: "/profil" }]}>
        <div className="flex items-center justify-center py-12">
          <div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
        </div>
      </ProfilShell>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    const { error } = await updateProfile({
      prenom: prenom.trim(),
      nom: nom.trim(),
      telephone: telephone.trim() || null,
      adresse: adresse.trim() || null,
      ville: ville.trim() || null,
      pays: pays.trim() || null,
    });
    setEnCours(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Informations mises à jour");
    navigate({ to: "/profil" });
  };

  return (
    <ProfilShell
      title="Mes informations"
      crumbs={[{ label: "Mon profil", to: "/profil" }, { label: "Informations" }]}
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl rounded-lg border border-border bg-card p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input
              id="prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
              maxLength={60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nom">Nom</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              maxLength={60}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+229 00 00 00 00"
              maxLength={20}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Quartier, rue…"
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ville">Ville</Label>
            <Input
              id="ville"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Cotonou"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pays">Pays</Label>
            <Input
              id="pays"
              value={pays}
              onChange={(e) => setPays(e.target.value)}
              placeholder="Bénin"
              maxLength={100}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit" variant="gold" disabled={enCours}>
            <CheckCircle2 />
            {enCours ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button asChild type="button" variant="ghost">
            <Link to="/profil">Annuler</Link>
          </Button>
        </div>
      </form>
    </ProfilShell>
  );
}
