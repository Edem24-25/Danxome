import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { MfaEnroll } from "@/components/auth/mfa-enroll";
import { accueilProfil } from "@/lib/types/user";
import { AuthLayout } from "@/components/site/AuthLayout";

export const Route = createFileRoute("/auth/mfa-setup")({
  head: () => ({
    meta: [
      { title: "Configuration de la sécurité — DanXomè" },
      {
        name: "description",
        content: "Activez la validation en deux étapes pour sécuriser votre compte.",
      },
    ],
  }),
  component: MfaSetup,
});

function MfaSetup() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleEnrolled = () => {
    toast.success("2FA activée ! Bienvenue sur DanXomè.");
    if (profile) {
      navigate({ to: accueilProfil(profile.profil) });
    } else {
      navigate({ to: "/profil" });
    }
  };

  const handleCancelled = async () => {
    await signOut();
    navigate({ to: "/auth/login", search: { from: undefined } });
  };

  return (
    <AuthLayout
      eyebrow="Sécurité"
      titre="Activez la validation en deux étapes"
      intro="Pour sécuriser votre compte, vous devez activer la 2FA. Scannez le QR code avec votre application d'authentification."
      footer={
        <Link
          to="/auth/login"
          search={{ from: undefined }}
          className="group inline-flex items-center gap-2 font-semibold text-forest transition-all duration-300 hover:text-terracotta hover:gap-3"
        >
          Retour à la connexion
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      }
    >
      <MfaEnroll onEnrolled={handleEnrolled} onCancelled={handleCancelled} />
    </AuthLayout>
  );
}
