import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  Palette,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/site/DashboardShell";
import { SectionTitle, StatCard } from "@/components/site/Bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { artistes, evenements, oeuvres, sites } from "@/lib/data";
import { useAuth } from "@/contexts/auth";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/user";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Back-office institutionnel — DanXomè" },
      {
        name: "description",
        content:
          "Modération des contenus, validation des artisans partenaires et suivi de fréquentation du patrimoine béninois.",
      },
      { property: "og:title", content: "Back-office institutionnel — DanXomè" },
      { property: "og:description", content: "Modération, partenaires et statistiques DanXomè." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const items = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/admin/moderation", label: "Modération", icon: ShieldCheck },
  { to: "/culture", label: "Contenus", icon: Palette },
  { to: "/evenements", label: "Événements", icon: CalendarDays },
  { to: "/art", label: "Partenaires", icon: Users },
  { to: "/profil", label: "Mon profil", icon: UserRound },
];

function Admin() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth/login" });
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

  const totalUsers = profiles.length;
  const artistCount = profiles.filter((p) => p.profil === "artiste").length;
  const artisanCount = profiles.filter((p) => p.profil === "artisan").length;
  const visitorCount = profiles.filter((p) => p.profil === "visiteur").length;

  return (
    <DashboardShell
      space="Administration"
      items={items}
      title="Pilotage de la plateforme"
      crumbs={[{ label: "Administration" }]}
      actions={
        <Button asChild variant="gold" size="sm">
          <Link to="/admin/moderation">
            <ShieldCheck /> File de modération
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Utilisateurs"
          value={loadingProfiles ? "…" : String(totalUsers)}
          delta={`${visitorCount} visiteurs`}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Artistes"
          value={loadingProfiles ? "…" : String(artistCount)}
          icon={<Palette className="size-4" />}
        />
        <StatCard
          label="Artisans"
          value={loadingProfiles ? "…" : String(artisanCount)}
          delta="+2 ce trimestre"
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Événements planifiés"
          value={String(evenements.length)}
          icon={<CalendarDays className="size-4" />}
        />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <SectionTitle eyebrow="Modération" title="En attente de validation" />
          <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Demande</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Ville</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 font-semibold text-forest-deep">Atelier Hounkpatin</td>
                  <td className="px-4 py-3">
                    <Badge variant="quiet">Artisan</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Bohicon</td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/admin/moderation">Examiner</Link>
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-forest-deep">
                    Musée de la Fondation Vallée
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="quiet">Contenu</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Cotonou</td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/culture/musees/fondation-vallee">Examiner</Link>
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-forest-deep">Festival Zangbéto</td>
                  <td className="px-4 py-3">
                    <Badge variant="quiet">Événement</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">Porto-Novo</td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/evenements/zangbeto">Examiner</Link>
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <SectionTitle eyebrow="Fréquentation" title="Visites par site (30 jours)" />
          <div className="mt-5 space-y-4 rounded-lg border border-border bg-card p-6">
            {sites.map((s, i) => {
              const part = 100 - i * 18;
              return (
                <div key={s.slug}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-forest-deep">{s.nom}</span>
                    <span className="text-muted-foreground">{s.avis * 4} visiteurs</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-forest" style={{ width: `${part}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-secondary/50 p-6">
            <p className="eyebrow">Derniers inscrits</p>
            <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
              {loadingProfiles ? (
                <li>Chargement…</li>
              ) : (
                profiles.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <span className="font-semibold text-forest-deep">
                      {p.prenom} {p.nom}
                    </span>{" "}
                    · {p.profil}
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-forest-deep p-6 text-ivory">
            <p className="eyebrow text-accent">Conformité</p>
            <p className="mt-3 text-sm leading-relaxed text-ivory/75">
              Les contenus patrimoniaux sont validés par le Ministère du Tourisme, de la Culture et
              des Arts avant publication. Chaque modification est historisée.
            </p>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
