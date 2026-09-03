import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Lock } from "lucide-react";
import { ProfilShell } from "@/components/site/ProfilShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/profil/mot-de-passe")({
  head: () => ({
    meta: [
      { title: "Mot de passe — DanXomè" },
      { name: "description", content: "Changez votre mot de passe sur DanXomè." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilMotDePasse,
});

function ProfilMotDePasse() {
  const { loading, user, changePassword } = useAuth();
  const navigate = useNavigate();
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [enCours, setEnCours] = useState(false);

  if (loading || !user) {
    return (
      <ProfilShell
        title="Mot de passe"
        crumbs={[{ label: "Mon profil", to: "/profil" }, { label: "Mot de passe" }]}
      >
        <div className="space-y-4 py-4">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
      </ProfilShell>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nouveau.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (nouveau !== confirmation) {
      toast.error("Les deux mots de passe ne correspondent pas");
      return;
    }
    setEnCours(true);
    const { error } = await changePassword(nouveau);
    setEnCours(false);
    if (error) {
      toast.error("Impossible de changer le mot de passe", { description: error });
      return;
    }
    toast.success("Mot de passe modifié avec succès");
    setNouveau("");
    setConfirmation("");
    navigate({ to: "/profil" });
  };

  return (
    <ProfilShell
      title="Mot de passe"
      crumbs={[{ label: "Mon profil", to: "/profil" }, { label: "Mot de passe" }]}
    >
      <form
        method="post"
        action="#"
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 rounded-lg border border-border bg-card p-6"
      >
        <p className="text-sm text-muted-foreground">
          Choisissez un mot de passe d'au moins 8 caractères. Vous resterez connecté après le
          changement.
        </p>
        <div className="space-y-2">
          <Label htmlFor="nouveau">Nouveau mot de passe</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="nouveau"
              type="password"
              value={nouveau}
              onChange={(e) => setNouveau(e.target.value)}
              className="pl-9"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmation">Confirmer le mot de passe</Label>
          <Input
            id="confirmation"
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" variant="gold" disabled={enCours}>
            <KeyRound />
            {enCours ? "Enregistrement…" : "Changer le mot de passe"}
          </Button>
          <Button asChild type="button" variant="ghost">
            <Link to="/profil">Annuler</Link>
          </Button>
        </div>
      </form>
    </ProfilShell>
  );
}
