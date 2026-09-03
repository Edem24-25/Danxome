import { useEffect, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Star, MessageSquare, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Button, buttonVariants } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Avis {
  id: string;
  user_id: string;
  plat_slug: string;
  note: number;
  commentaire: string | null;
  created_at: string;
}

export function AvisSection({ platSlug }: { platSlug: string }) {
  const { user } = useAuth();
  const supabase = createClient();
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [sending, setSending] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const fetchAvis = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("avis_plats")
        .select("*")
        .eq("plat_slug", platSlug)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setAvis(data as Avis[]);
    } catch {
      setAvis([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, platSlug]);

  useEffect(() => {
    fetchAvis();
  }, [fetchAvis]);

  const moyenne = avis.length > 0 ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length : 0;

  const monAvis = user ? avis.find((a) => a.user_id === user.id) : null;

  const soumettre = async () => {
    if (!user || sending) return;
    setSending(true);
    try {
      if (monAvis) {
        await supabase
          .from("avis_plats")
          .update({ note, commentaire: commentaire || null })
          .eq("id", monAvis.id);
      } else {
        await supabase.from("avis_plats").insert({
          user_id: user.id,
          plat_slug: platSlug,
          note,
          commentaire: commentaire || null,
        });
      }
      setCommentaire("");
      await fetchAvis();
    } catch {
      toast.error("Erreur", { description: "Impossible de sauvegarder l'avis." });
    }
    setSending(false);
  };

  const supprimer = async (id: string) => {
    try {
      await supabase.from("avis_plats").delete().eq("id", id);
      await fetchAvis();
      toast.success("Avis supprimé");
    } catch {
      toast.error("Erreur", { description: "Impossible de supprimer l'avis." });
    }
  };

  return (
    <div>
      <p className="eyebrow">Avis des visiteurs</p>

      {/* Résumé */}
      <div className="mt-5 flex items-center gap-4">
        <div className="text-center">
          <p className="font-display text-4xl text-forest-deep">{moyenne.toFixed(1)}</p>
          <div className="mt-1 flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  "size-4",
                  s <= Math.round(moyenne)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200",
                )}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{avis.length} avis</p>
        </div>
      </div>

      {/* Formulaire */}
      {user && (
        <div className="mt-8 rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-semibold">
            {monAvis ? "Modifier votre avis" : "Donner votre avis"}
          </p>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setNote(s)}
                aria-label={`${s} étoile${s > 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "size-6 transition-colors",
                    s <= (hoveredStar || note)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200",
                  )}
                />
              </button>
            ))}
          </div>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Partagez votre expérience (optionnel)"
            rows={3}
            className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={soumettre} disabled={sending} className="rounded-full">
              {monAvis ? "Mettre à jour" : "Publier"}
            </Button>
            {monAvis && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer votre avis ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Votre avis sera définitivement supprimé. Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      className={buttonVariants({ variant: "destructive" })}
                      onClick={() => supprimer(monAvis.id)}
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      )}

      {!user && (
        <p className="mt-6 text-sm text-muted-foreground">
          <Link
            to="/auth/login"
            search={{ from: currentPath ?? undefined }}
            className="text-accent underline"
          >
            Connectez-vous
          </Link>{" "}
          pour laisser un avis.
        </p>
      )}

      {/* Liste des avis */}
      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Chargement…</p>
      ) : avis.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          <MessageSquare className="mr-1 inline size-4" />
          Aucun avis pour l'instant. Soyez le premier !
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {avis.map((a) => (
            <div key={a.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-forest-deep text-xs font-bold text-ivory">
                  V
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Visiteur</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "size-3.5",
                        s <= a.note
                          ? "fill-amber-400 text-amber-400"
                          : "fill-gray-200 text-gray-200",
                      )}
                    />
                  ))}
                </div>
              </div>
              {a.commentaire && (
                <p className="mt-3 text-sm leading-relaxed text-foreground/80">{a.commentaire}</p>
              )}
              {user?.id === a.user_id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="mt-2 text-xs text-destructive hover:underline">
                      Supprimer
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer cet avis ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cet avis sera définitivement supprimé. Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        className={buttonVariants({ variant: "destructive" })}
                        onClick={() => supprimer(a.id)}
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
