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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("profil")
          .eq("id", session.user.id)
          .single();
        navigate({ to: accueilProfil(prof?.profil) });
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
