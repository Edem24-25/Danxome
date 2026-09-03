import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { useRateLimit } from "@/lib/rate-limit";

export const Route = createFileRoute("/auth/reset")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — DanXomè" },
      {
        name: "description",
        content: "Réinitialisez le mot de passe de votre compte DanXomè.",
      },
      { property: "og:title", content: "Mot de passe oublié — DanXomè" },
      { property: "og:description", content: "Recevez un lien de réinitialisation par e-mail." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const resetRL = useRateLimit("reset", 10, 15000);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { allowed, remaining } = resetRL.check();
    if (!allowed) {
      toast.error("Trop de tentatives", {
        description: `Réessayez dans ${remaining} secondes.`,
      });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("mail") as string).trim().toLowerCase();

    const { error } = await resetPassword(email);

    if (error) {
      resetRL.record();
      setLoading(false);
      return;
    }

    resetRL.reset();
    setEnvoye(true);
    setLoading(false);
  };

  return (
    <AuthLayout
      eyebrow="Réinitialisation"
      titre="Retrouver l'accès"
      intro="Indiquez l'adresse associée à votre compte : nous vous envoyons un lien valable une heure."
      footer={
        <Link
          to="/auth/login"
          search={{ from: undefined }}
          className="font-semibold text-forest hover:text-terracotta"
        >
          ← Retour à la connexion
        </Link>
      }
    >
      {envoye ? (
        <div className="rounded-lg border border-forest/30 bg-secondary p-6">
          <MailCheck className="size-6 text-forest" />
          <h2 className="mt-3 font-display text-xl text-forest-deep">Lien envoyé</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Vérifiez votre boîte de réception, puis choisissez un nouveau mot de passe. Pensez au
            dossier indésirables.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => setEnvoye(false)}>
            Renvoyer le lien
          </Button>
        </div>
      ) : (
        <form method="post" action="#" className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="mail">Adresse e-mail</Label>
            <Input
              id="mail"
              name="mail"
              type="email"
              required
              maxLength={255}
              placeholder="kossi@exemple.bj"
            />
          </div>
          <Button variant="gold" size="lg" className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Envoi…
              </span>
            ) : (
              "Envoyer le lien"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
