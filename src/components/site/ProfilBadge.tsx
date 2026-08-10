import type { ProfilType } from "@/lib/types/user";
import { cn } from "@/lib/utils";

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

export function ProfilBadge({ profil, className }: { profil: ProfilType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles[profil],
        className,
      )}
    >
      {labels[profil]}
    </span>
  );
}
