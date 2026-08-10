import { Heart, KeyRound, LayoutDashboard, Settings, ShoppingBag, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardShell, type NavItem } from "./DashboardShell";
import { useAuth } from "@/contexts/auth";
import type { Crumb } from "./Bits";

const BASE: NavItem[] = [
  { to: "/profil", label: "Mon profil", icon: UserRound },
  { to: "/profil/details", label: "Mes informations", icon: Settings },
  { to: "/profil/commandes", label: "Mes commandes", icon: ShoppingBag },
  { to: "/profil/favoris", label: "Mes favoris", icon: Heart },
  { to: "/profil/mot-de-passe", label: "Mot de passe", icon: KeyRound },
];

export function ProfilShell({
  title,
  crumbs,
  actions,
  children,
}: {
  title: string;
  crumbs: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { profile } = useAuth();

  const espace: NavItem[] =
    profile?.profil === "admin"
      ? [{ to: "/admin", label: "Espace admin", icon: LayoutDashboard }]
      : profile?.profil === "artiste" || profile?.profil === "artisan"
        ? [{ to: "/artiste", label: "Mon espace", icon: LayoutDashboard }]
        : [];

  return (
    <DashboardShell
      space="Mon profil"
      items={[...BASE, ...espace]}
      title={title}
      crumbs={crumbs}
      actions={actions}
    >
      {children}
    </DashboardShell>
  );
}
