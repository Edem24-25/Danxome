import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Eye,
  LayoutDashboard,
  Palette as PaletteIcon,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/site/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/user";

export const Route = createFileRoute("/admin/moderation")({
  head: () => ({
    meta: [
      { title: "Modération — DanXomè" },
      {
        name: "description",
        content: "File de modération des contenus, artisans et événements.",
      },
    ],
  }),
  component: Moderation,
});

const items = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/admin/moderation", label: "Modération", icon: Eye },
  { to: "/culture", label: "Contenus", icon: PaletteIcon },
  { to: "/evenements", label: "Événements", icon: CalendarDays },
  { to: "/art", label: "Partenaires", icon: Users },
  { to: "/profil", label: "Mon profil", icon: UserRound },
];

function Moderation() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth/login", search: { from: undefined } });
    }
    if (!loading && profile && profile.profil !== "admin") {
      navigate({ to: "/profil" });
    }
  }, [loading, user, profile, navigate]);

  useEffect(() => {
    if (profile?.profil === "admin") {
      const supabase = createClient();
      supabase
        .from("profiles")
        .select("id, email, prenom, nom, profil, created_at")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setProfiles((data as Profile[]) ?? []);
          setLoadingProfiles(false);
        });
    }
  }, [profile]);

  if (loading || !profile || profile.profil !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
      </div>
    );
  }

  const pendingArtisans = profiles.filter((p) => p.profil === "artisan");
  const pendingCount = pendingArtisans.length;

  return (
    <DashboardShell
      space="Administration"
      items={items}
      title="File de modération"
      crumbs={[{ label: "Administration", to: "/admin" }, { label: "Modération" }]}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin">
            <ArrowLeft className="mr-1 size-4" /> Retour
          </Link>
        </Button>
      }
    >
      <div className="space-y-8">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-forest-deep">En attente de validation</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {pendingCount} élément{pendingCount > 1 ? "s" : ""} en attente
              </p>
            </div>
            <Badge variant="quiet">{pendingCount}</Badge>
          </div>

          {pendingCount === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Aucun élément en attente de validation.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {pendingArtisans.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-forest/10 text-forest">
                      <Users className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-forest-deep">
                        {p.prenom} {p.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">{p.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <XCircle className="mr-1 size-4" /> Refuser
                    </Button>
                    <Button variant="gold" size="sm">
                      <CheckCircle className="mr-1 size-4" /> Approuver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg text-forest-deep">Historique</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Les modérations récentes apparaîtront ici.
          </p>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Aucune modération récente.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
