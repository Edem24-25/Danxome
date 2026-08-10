import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock, ArrowRight, Check } from "lucide-react";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";

export const Route = createFileRoute("/auth/update-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Dãhomè" },
      {
        name: "description",
        content: "Choisissez un nouveau mot de passe pour votre compte Dãhomè.",
      },
    ],
  }),
  component: UpdatePassword,
});

function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmation = formData.get("confirmation") as string;

    if (password.length < 8) {
      toast.error("Mot de passe trop court", {
        description: "Le mot de passe doit contenir au moins 8 caractères.",
      });
      setLoading(false);
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpper || !hasLower || !hasNumber) {
      toast.error("Mot de passe trop simple", {
        description:
          "Le mot de passe doit inclure au moins une majuscule, une minuscule et un chiffre.",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Erreur", { description: "Impossible de mettre à jour le mot de passe." });
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    toast.success("Mot de passe mis à jour");
    setTimeout(() => navigate({ to: "/auth/login" }), 2000);
  };

  if (!session) {
    return (
      <AuthLayout
        eyebrow="Erreur"
        titre="Lien invalide"
        intro="Ce lien de réinitialisation n'est pas valide ou a expiré."
        footer={
          <Link to="/auth/reset" className="font-semibold text-forest hover:text-terracotta">
            Demander un nouveau lien
          </Link>
        }
      >
        <div className="text-center text-sm text-muted-foreground">
          <p>Veuillez demander un nouveau lien de réinitialisation.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="Nouveau mot de passe"
      titre="Choisissez votre mot de passe"
      intro="Entrez un nouveau mot de passe sécurisé pour votre compte."
      footer={
        <Link to="/auth/login" className="font-semibold text-forest hover:text-terracotta">
          ← Retour à la connexion
        </Link>
      }
    >
      {success ? (
        <div className="rounded-lg border border-forest/30 bg-secondary p-6 text-center">
          <Check className="mx-auto size-6 text-forest" />
          <h2 className="mt-3 font-display text-xl text-forest-deep">Mot de passe mis à jour</h2>
          <p className="mt-2 text-sm text-muted-foreground">Redirection vers la connexion…</p>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmation">Confirmer le mot de passe</Label>
            <Input
              id="confirmation"
              name="confirmation"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <Button variant="gold" size="lg" className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Mise à jour…
              </span>
            ) : (
              <>
                Mettre à jour
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
