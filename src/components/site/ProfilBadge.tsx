import type { ProfilType, ProfilStatut } from "@/lib/types/user";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

const styles: Record<ProfilType, string> = {
  visiteur: "border-terracotta/30 bg-terracotta/10 text-terracotta",
  artiste: "border-forest/30 bg-forest/10 text-forest",
  artisan: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  admin: "border-rose-500/30 bg-rose-500/10 text-rose-600",
};

const labels: Record<ProfilType, string> = {
  visiteur: "Visiteur",
  artiste: "Artiste",
  artisan: "Artisan",
  admin: "Administrateur",
};

interface ProfilBadgeProps {
  profil: ProfilType;
  statut?: ProfilStatut;
  className?: string;
}

export function ProfilBadge({ profil, statut, className }: ProfilBadgeProps) {
  const estVerifie = profil !== "visiteur" && profil !== "admin" && statut === "valide";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          styles[profil],
          className,
        )}
      >
        {labels[profil]}
      </span>
      {estVerifie && (
        <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
          <CheckCircle className="size-3" />
          Vérifié
        </span>
      )}
    </span>
  );
}
