import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { accueilProfil } from "@/lib/types/user";
import type { ProfilType } from "@/lib/types/user";
import { useRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/client";
import { MfaGate } from "@/components/auth/mfa-gate";

function sanitizeRedirect(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (!path.startsWith("/") || path.includes("://") || path.startsWith("//")) {
    return undefined;
  }
  return path;
}

export const Route = createFileRoute("/auth/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: sanitizeRedirect(search["from"] as string | undefined),
  }),
  head: () => ({
    meta: [
      { title: "Connexion — DanXomè" },
      {
        name: "description",
        content: "Accédez à vos favoris, commandes et dons sur DanXomè.",
      },
      { property: "og:title", content: "Connexion — DanXomè" },
      { property: "og:description", content: "Accédez à votre compte DanXomè." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { from } = Route.useSearch();
  const [loading, setLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [profileAfterLogin, setProfileAfterLogin] = useState<{ profil: string } | null>(null);
  const { signIn, signInWithGoogle, signOut } = useAuth();
  const loginRL = useRateLimit("login", 5, 30000);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { allowed, remaining } = loginRL.check();
    if (!allowed) {
      toast.error("Trop de tentatives", {
        description: `Réessayez dans ${remaining} secondes.`,
      });
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim().toLowerCase();
    const password = formData.get("pass") as string;

    const { error, profil } = await signIn({ email, password });

    if (error) {
      loginRL.record();
      toast.error("Erreur de connexion", {
        description: "Email ou mot de passe incorrect.",
      });
      setLoading(false);
      return;
    }

    loginRL.reset();
    setProfileAfterLogin({ profil: profil ?? "visiteur" });

    const supabase = createClient();
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (data?.nextLevel === "aal2" && data?.currentLevel !== "aal2") {
      setShowMfa(true);
      setLoading(false);
    } else if (data?.nextLevel === "aal1" && data?.currentLevel === "aal1") {
      navigate({ to: "/auth/mfa-setup" as never });
    } else {
      toast.success("Connexion réussie");
      if (from) {
        navigate({ to: from });
      } else {
        navigate({ to: accueilProfil(profil) });
      }
    }
  };

  const handleMfaComplete = () => {
    toast.success("Connexion réussie");
    if (from) {
      navigate({ to: from });
    } else if (profileAfterLogin) {
      navigate({ to: accueilProfil(profileAfterLogin.profil as ProfilType) });
    } else {
      navigate({ to: "/profil" });
    }
  };

  const handleMfaLogout = async () => {
    await signOut();
    setShowMfa(false);
    setProfileAfterLogin(null);
  };

  const handleGoogle = async () => {
    await signInWithGoogle();
  };

  if (showMfa) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ivory to-white p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-lg">
          <MfaGate
            onMfaComplete={handleMfaComplete}
            onLogout={handleMfaLogout}
          >
            <></>
          </MfaGate>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      eyebrow="Espace membre"
      titre="Bon retour"
      intro="Retrouvez vos itinéraires, vos favoris et les artisans que vous soutenez."
      footer={
        <Link
          to="/auth/register"
          className="group inline-flex items-center gap-2 font-semibold text-forest transition-all duration-300 hover:text-terracotta hover:gap-3"
        >
          Créer un compte
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-forest-deep">
            Adresse e-mail
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="kossi@exemple.bj"
              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="pass" className="text-sm font-medium text-forest-deep">
              Mot de passe
            </Label>
            <Link
              to="/auth/reset"
              className="text-xs text-terracotta/80 transition-colors hover:text-terracotta hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
            <Input
              id="pass"
              name="pass"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
        </div>

        <Button
          variant="gold"
          size="lg"
          className="w-full group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-terracotta/20"
          type="submit"
          disabled={loading}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Connexion…
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </span>
        </Button>
      </form>

      <Button
        variant="outline"
        className="w-full group relative overflow-hidden transition-all duration-300 hover:border-forest/40 hover:bg-forest/5"
        onClick={handleGoogle}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuer avec Google
        </span>
      </Button>
    </AuthLayout>
  );
}
