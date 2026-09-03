import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { accueilProfil } from "@/lib/types/user";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const supabase = createClient();
    const url = new URL(window.location.href);
    const next = url.searchParams.get("next");

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("profil, prenom, nom")
          .eq("id", session.user.id)
          .single();

        if (prof && (!prof.prenom || !prof.nom)) {
          const meta = session.user.user_metadata ?? {};
          const prenom =
            prof.prenom || meta["given_name"] || meta["full_name"]?.split(" ")[0] || "";
          const nom =
            prof.nom ||
            meta["family_name"] ||
            (meta["full_name"] ?? "").split(" ").slice(1).join(" ") ||
            "";
          if (prenom || nom) {
            await supabase.from("profiles").update({ prenom, nom }).eq("id", session.user.id);
          }
        }

        navigate({ to: next || accueilProfil(prof?.profil) });
      } else {
        navigate({ to: "/auth/login", search: { from: undefined } });
      }
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-forest border-t-transparent" />
    </div>
  );
}
