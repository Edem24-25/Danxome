import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  Palette,
  Hammer,
  Phone,
  MapPin,
  FileText,
  LinkIcon,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth";
import { useRateLimit } from "@/lib/rate-limit";
import { registerSchema, registerStep2Schema } from "@/lib/validations";
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
    label: "Artisan d'art",
    description: "Vendre vos créations, gérer votre boutique",
    icon: Hammer,
    color: "text-amber-600",
  },
];

const categories = [
  "Sculpture",
  "Peinture",
  "Bronze d'art",
  "Poterie & Céramique",
  "Tissage & Textile",
  "Bijouterie",
  "Marqueterie",
  "Vannerie",
  "Luthierie",
  "Autre",
];

function Register() {
  const [step, setStep] = useState<1 | 2 | "success">(1);
  const [loading, setLoading] = useState(false);
  const [selectedProfil, setSelectedProfil] = useState<ProfilType>("visiteur");
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const registerRL = useRateLimit("register", 3, 60000);

  // Step 1 form data (saved in state to preserve on back navigation)
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleStep1 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { allowed, remaining } = registerRL.check();
    if (!allowed) {
      toast.error("Trop de tentatives", {
        description: `Réessayez dans ${remaining} secondes.`,
      });
      return;
    }

    const parsed = registerSchema.safeParse({
      prenom: prenom.trim(),
      nom: nom.trim(),
      email: email.trim(),
      password,
      profil: selectedProfil,
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      toast.error("Erreur de validation", {
        description: firstError?.message ?? "Veuillez vérifier vos informations.",
      });
      return;
    }

    // If visiteur, submit directly
    if (selectedProfil === "visiteur") {
      setLoading(true);
      const { error } = await signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        prenom: parsed.data.prenom,
        nom: parsed.data.nom,
        profil: parsed.data.profil,
      });
      setLoading(false);

      if (error) {
        toast.error("Erreur lors de l'inscription", { description: error });
        return;
      }

      toast.success("Compte créé avec succès", {
        description: "Vous allez être redirigé vers la configuration de la sécurité.",
      });
      navigate({ to: "/auth/mfa-setup" as never });
      return;
    }

    // If artiste/artisan, go to step 2
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const parsed = registerStep2Schema.safeParse({
      telephone: (formData.get("telephone") as string)?.trim(),
      ville: (formData.get("ville") as string)?.trim(),
      categorie: (formData.get("categorie") as string)?.trim(),
      description: (formData.get("description") as string)?.trim(),
      portfolio_url: (formData.get("portfolio") as string)?.trim(),
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      toast.error("Erreur de validation", {
        description: firstError?.message ?? "Veuillez vérifier vos informations.",
      });
      return;
    }

    setLoading(true);

    // Single signUp call with all data — the trigger handles profile + artiste creation
    const { error: signUpError } = await signUp({
      email,
      password,
      prenom,
      nom,
      profil: selectedProfil,
      ...(parsed.data.telephone ? { telephone: parsed.data.telephone } : {}),
      ...(parsed.data.ville ? { ville: parsed.data.ville } : {}),
      categorie: parsed.data.categorie,
      description: parsed.data.description,
      ...(parsed.data.portfolio_url ? { portfolio_url: parsed.data.portfolio_url } : {}),
    });

    setLoading(false);

    if (signUpError) {
      toast.error("Erreur lors de l'inscription", { description: signUpError });
      return;
    }

    setStep("success");
    toast.success("Demande d'inscription envoyée", {
      description: "Vous allez être redirigé vers la configuration de la sécurité.",
    });
    setTimeout(() => {
      navigate({ to: "/auth/mfa-setup" as never });
    }, 2000);
  };

  const profilChoisi =
    selectedProfil === "artiste"
      ? profils.find((p) => p.value === "artiste")
      : profils.find((p) => p.value === "artisan");

  return (
    <AuthLayout
      eyebrow={step === "success" ? "Inscription" : `Étape ${step === 1 ? "1" : "2"} sur 2`}
      titre={
        step === "success"
          ? "Demande envoyée"
          : step === 1
            ? "Rejoindre DanXomè"
            : "Votre profil professionnel"
      }
      intro={
        step === "success"
          ? "Votre demande d'inscription a bien été enregistrée."
          : step === 1
            ? "Créez votre compte pour explorer le patrimoine béninois."
            : `Vous avez choisi : ${profilChoisi?.label}. Complétez votre profil pour que l'équipe puisse examiner votre demande.`
      }
      footer={
        step === "success" ? (
          <Link
            to="/auth/login"
            search={{ from: undefined }}
            className="group inline-flex items-center gap-2 font-semibold text-forest transition-all duration-300 hover:text-terracotta hover:gap-3"
          >
            Se connecter
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        ) : step === 2 ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="group inline-flex items-center gap-2 font-semibold text-forest transition-all duration-300 hover:text-terracotta hover:gap-3"
          >
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Retour à l'étape 1
          </button>
        ) : (
          <Link
            to="/auth/login"
            search={{ from: undefined }}
            className="group inline-flex items-center gap-2 font-semibold text-forest transition-all duration-300 hover:text-terracotta hover:gap-3"
          >
            Se connecter
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        )
      }
    >
      {/* ═══ SUCCESS STATE ═══ */}
      {step === "success" && (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="size-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="text-forest-deep">
                Votre demande d'inscription a été enregistrée.
              </strong>
              <br />
              Votre profil sera étudié par notre équipe. Vous serez informé de la décision de
              l'administrateur par e-mail.
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>En attendant :</strong> vous pouvez vous connecter, mais l'accès aux
              fonctionnalités artiste/artisan sera disponible uniquement après validation.
            </p>
          </div>
        </div>
      )}

      {/* ═══ STEP 1 — Informations personnelles ═══ */}
      {step === 1 && (
        <form className="space-y-6" onSubmit={handleStep1}>
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
                      <Icon
                        className={`size-4 ${isSelected ? p.color : "text-muted-foreground"}`}
                      />
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
                Un deuxième étape sera nécessaire pour compléter votre profil professionnel.
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
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
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
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              checked={acceptedTerms}
              onCheckedChange={(v) => setAcceptedTerms(v === true)}
              className="mt-0.5 transition-all duration-200 group-hover:border-terracotta"
            />
            <span className="group-hover:text-forest-deep transition-colors">
              J'accepte les{" "}
              <span className="font-medium text-forest">conditions d'utilisation</span> et la{" "}
              <span className="font-medium text-forest">politique de confidentialité</span> de
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
              ) : selectedProfil === "visiteur" ? (
                <>
                  Créer mon compte
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              ) : (
                <>
                  Continuer
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </span>
          </Button>
        </form>
      )}

      {/* ═══ STEP 2 — Profil professionnel ═══ */}
      {step === 2 && (
        <form className="space-y-5" onSubmit={handleStep2}>
          {/* Badge du profil choisi (read-only) */}
          <div className="flex items-center gap-3 rounded-lg border-2 border-terracotta bg-terracotta/5 p-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-terracotta/10">
              {selectedProfil === "artiste" ? (
                <Palette className="size-4 text-terracotta" />
              ) : (
                <Hammer className="size-4 text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-forest-deep">
                {selectedProfil === "artiste" ? "Artiste" : "Artisan d'art"}
              </p>
              <p className="text-xs text-muted-foreground">Profil sélectionné à l'étape 1</p>
            </div>
          </div>

          {/* Téléphone & Ville */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-sm font-medium text-forest-deep">
                Téléphone
              </Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
                <Input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  placeholder="+229 01 00 00 00"
                  className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ville" className="text-sm font-medium text-forest-deep">
                Ville <span className="text-terracotta">*</span>
              </Label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
                <Input
                  id="ville"
                  name="ville"
                  required
                  maxLength={100}
                  placeholder="Cotonou, Porto-Novo…"
                  className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
                />
              </div>
            </div>
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="categorie" className="text-sm font-medium text-forest-deep">
              Catégorie / Spécialité <span className="text-terracotta">*</span>
            </Label>
            <select
              id="categorie"
              name="categorie"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
            >
              <option value="">Sélectionnez votre spécialité</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-forest-deep">
              Description de votre activité <span className="text-terracotta">*</span>
            </Label>
            <div className="relative group">
              <FileText className="absolute left-3 top-3 size-4 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                minLength={10}
                maxLength={2000}
                placeholder="Décrivez votre art, votre parcours, vos influences…"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta resize-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum 10 caractères. Cette description sera visible sur votre profil public.
            </p>
          </div>

          {/* Portfolio */}
          <div className="space-y-2">
            <Label htmlFor="portfolio" className="text-sm font-medium text-forest-deep">
              Portfolio / Site web{" "}
              <span className="text-xs text-muted-foreground">(optionnel)</span>
            </Label>
            <div className="relative group">
              <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-terracotta" />
              <Input
                id="portfolio"
                name="portfolio"
                type="url"
                placeholder="https://votre-site.com"
                className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Lien vers votre portfolio en ligne, Instagram, Behance…
            </p>
          </div>

          {/* Note */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Après soumission :</strong> votre demande sera examinée par notre équipe. Vous
              recevrez une notification par e-mail une fois votre profil validé.
            </p>
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
                  Envoi en cours…
                </>
              ) : (
                <>
                  Soumettre ma demande d'inscription
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </span>
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
