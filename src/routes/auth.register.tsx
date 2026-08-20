import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User, Mail, Lock, ArrowRight, Eye, Palette, Hammer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth";
import { useRateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validations";
import type { ProfilType } from "@/lib/types/user";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Créer un compte — DanXomè" },
      {
        name: "description",
        content:
          "Créez votre compte et accédez au patrimoine béninois : visites virtuelles, réservations et boutique artisanale.",
      },
      { property: "og:title", content: "Créer un compte — DanXomè" },
      {
        property: "og:description",
        content: "Inscrivez-vous pour explorer le patrimoine du Bénin.",
      },
    ],
  }),
  component: Register,
});

const profils: {
  value: ProfilType;
  label: string;
  description: string;
  icon: typeof Eye;
  color: string;
}[] = [
  {
    value: "visiteur",
    label: "Visiteur",
    description: "Explorer le patrimoine, réserver des visites, commander",
    icon: Eye,
    color: "text-forest",
  },
  {
    value: "artiste",
    label: "Artiste",
    description: "Exposer vos œuvres, vendre, gérer votre portfolio",
    icon: Palette,
    color: "text-terracotta",
  },
  {
    value: "artisan",
    label: "Artisan",
    description: "Vendre vos créations, gérer votre boutique",
    icon: Hammer,
    color: "text-amber-600",
  },
];

function Register() {
  const [loading, setLoading] = useState(false);
  const [selectedProfil, setSelectedProfil] = useState<ProfilType>("visiteur");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const registerRL = useRateLimit("register", 3, 60000);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { allowed, remaining } = registerRL.check();
    if (!allowed) {
      toast.error("Trop de tentatives", {
        description: `Réessayez dans ${remaining} secondes.`,
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse({
      prenom: (formData.get("prenom") as string)?.trim(),
      nom: (formData.get("nom") as string)?.trim(),
      email: (formData.get("mail") as string)?.trim(),
      password: formData.get("mdp") as string,
      profil: selectedProfil,
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      toast.error("Erreur de validation", {
        description: firstError?.message ?? "Veuillez vérifier vos informations.",
      });
      return;
    }

    const { email, password, prenom, nom, profil } = parsed.data;

    setLoading(true);
    const { error } = await signUp({ email, password, prenom, nom, profil });

    if (error) {
      toast.error("Erreur lors de l'inscription", { description: error });
      setLoading(false);
      return;
    }

    const isArtisanOrArtiste = profil === "artiste" || profil === "artisan";
    toast.success("Compte créé avec succès", {
      description: isArtisanOrArtiste
        ? "Votre compte sera examiné par un administrateur avant activation."
        : "Vérifiez votre boîte mail pour confirmer votre compte.",
    });
    navigate({ to: "/auth/login", search: { from: undefined } });
  };

  return (
    <AuthLayout
      eyebrow="Inscription"
      titre="Rejoindre DanXomè"
      intro="Créez votre compte pour explorer le patrimoine béninois."
      footer={
        <Link
          to="/auth/login"
          search={{ from: undefined }}
          className="group inline-flex items-center gap-2 font-semibold text-forest transition-all duration-300 hover:text-terracotta hover:gap-3"
        >
          Se connecter
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Sélection du profil */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-forest-deep">Type de compte</Label>
          <div className="grid gap-3">
            {profils.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedProfil === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setSelectedProfil(p.value)}
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-terracotta bg-terracotta/5 shadow-sm"
                      : "border-border bg-background hover:border-muted-foreground/30"
                  }`}
                >
                  <div
                    className={`flex size-9 items-center justify-center rounded-full ${
                      isSelected ? "bg-terracotta/10" : "bg-muted"
                    }`}
                  >
                    <Icon className={`size-4 ${isSelected ? p.color : "text-muted-foreground"}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        isSelected ? "text-forest-deep" : "text-foreground"
                      }`}
                    >
                      {p.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  <div
                    className={`size-4 rounded-full border-2 ${
                      isSelected
                        ? "border-terracotta bg-terracotta"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {isSelected && (
                      <div className="flex size-full items-center justify-center">
                        <div className="size-1.5 rounded-full bg-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {(selectedProfil === "artiste" || selectedProfil === "artisan") && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block size-1.5 rounded-full bg-amber-500" />
              Votre compte sera examiné par un administrateur avant activation.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="prenom" className="text-sm font-medium text-forest-deep">
              Prénom
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
              <Input
                id="prenom"
                name="prenom"
                required
                maxLength={60}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nom" className="text-sm font-medium text-forest-deep">
              Nom
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
              <Input
                id="nom"
                name="nom"
                required
                maxLength={60}
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mail" className="text-sm font-medium text-forest-deep">
            Adresse e-mail
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
            <Input
              id="mail"
              name="mail"
              type="email"
              required
              maxLength={255}
              placeholder="votre@email.com"
              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mdp" className="text-sm font-medium text-forest-deep">
            Mot de passe
          </Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
            <Input
              id="mdp"
              name="mdp"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-forest font-medium">8 caractères minimum</span> — recommandé :
            majuscule, chiffre et symbole.
          </p>
        </div>

        <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer group">
          <Checkbox
            required
            className="mt-0.5 transition-all duration-200 group-hover:border-terracotta"
          />
          <span className="group-hover:text-forest-deep transition-colors">
            J'accepte les <span className="font-medium text-forest">conditions d'utilisation</span>{" "}
            et la <span className="font-medium text-forest">politique de confidentialité</span> de
            DanXomè.
          </span>
        </label>

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
                Création…
              </>
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </span>
        </Button>
      </form>
    </AuthLayout>
  );
}
