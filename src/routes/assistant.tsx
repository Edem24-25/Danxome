import { createFileRoute } from "@tanstack/react-router";
import { Compass, Send, Sparkles, User } from "lucide-react";
import { useRef, useState } from "react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHead } from "@/components/site/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant culturel IA — DanXomè" },
      {
        name: "description",
        content:
          "Posez vos questions sur le patrimoine béninois : itinéraires, histoire des royaumes, artisanat et festivals.",
      },
      { property: "og:title", content: "Assistant culturel IA — DanXomè" },
      {
        property: "og:description",
        content: "Un guide conversationnel pour préparer votre voyage culturel au Bénin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Assistant,
});

type Message = { role: "user" | "guide"; texte: string };

const suggestions = [
  "Quel itinéraire de 5 jours entre Abomey et Ouidah ?",
  "Que raconte une tenture appliquée d'Abomey ?",
  "Quand a lieu la fête de la Gaani à Nikki ?",
  "Comment se déroule une visite de Ganvié ?",
];

const reponses: Record<string, string> = {
  itineraire:
    "Jour 1 Cotonou et la Fondation Zinsou, jour 2 Ouidah et la Route des Esclaves, jour 3 Abomey et ses palais royaux, jour 4 Possotomè et le lac Ahémé, jour 5 Ganvié au lever du jour. Comptez un chauffeur-guide : les liaisons sont plus simples qu'en transport collectif.",
  default:
    "Le patrimoine béninois se lit à plusieurs échelles : les royaumes du plateau, les cités lacustres du sud et les traditions équestres du nord. Dites-moi la durée de votre séjour et vos centres d'intérêt, et je vous propose un parcours détaillé avec les musées, les ateliers d'artisans et les fêtes de saison.",
};

function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "guide",
      texte:
        "Bonjour, je suis le guide DanXomè. Je connais les royaumes, les sites classés, les artisans et l'agenda culturel du Bénin. Que souhaitez-vous découvrir ?",
    },
  ]);
  const [valeur, setValeur] = useState("");
  const [ecrit, setEcrit] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const envoyer = (texte: string) => {
    const propre = texte.trim();
    if (!propre || ecrit) return;
    setMessages((m) => [...m, { role: "user", texte: propre }]);
    setValeur("");
    setEcrit(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const cle = /itin|jour|circuit|voyage/i.test(propre) ? "itineraire" : "default";
      setMessages((m) => [...m, { role: "guide", texte: reponses[cle] ?? reponses["default"]! }]);
      setEcrit(false);
    }, 900);
  };

  return (
    <SiteShell>
      <PageHead
        eyebrow="Assistant IA"
        title="Votre guide culturel, à toute heure"
        intro="Un compagnon conversationnel nourri des archives DanXomè : histoire, itinéraires, artisanat et calendrier des fêtes."
        crumbs={[{ label: "Assistant IA" }]}
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:px-8">
        <div className="flex min-h-[32rem] flex-col overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border bg-forest-deep px-5 py-4">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="font-display text-lg text-ivory">Guide DanXomè</p>
              <p className="text-xs text-ivory/60">{ecrit ? "écrit…" : "en ligne"}</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "guide" && (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-forest">
                    <Sparkles className="size-4" />
                  </span>
                )}
                <p
                  className={cn(
                    "max-w-[36rem] rounded-lg px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-forest-deep text-ivory"
                      : "bg-secondary text-foreground/85",
                  )}
                >
                  {m.texte}
                </p>
                {m.role === "user" && (
                  <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <User className="size-4" />
                  </span>
                )}
              </div>
            ))}
            {ecrit && (
              <div className="flex gap-1.5 pl-11">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="size-2 animate-pulse rounded-full bg-terracotta"
                    style={{ animationDelay: `${d * 150}ms` }}
                  />
                ))}
              </div>
            )}
          </div>

          <form
            className="flex gap-2 border-t border-border p-4"
            onSubmit={(e) => {
              e.preventDefault();
              envoyer(valeur);
            }}
          >
            <Input
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              placeholder="Posez votre question sur le Bénin…"
              aria-label="Votre question"
            />
            <Button type="submit" variant="gold" disabled={ecrit}>
              <Send /> Envoyer
            </Button>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-secondary/50 p-6">
            <p className="eyebrow">Pistes de départ</p>
            <div className="mt-4 space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => envoyer(s)}
                  className="w-full rounded-md border border-border bg-card px-4 py-3 text-left text-sm text-foreground/80 transition-colors hover:border-accent hover:text-forest-deep"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            <p className="eyebrow flex items-center gap-2">
              <Compass className="size-4" /> Sources
            </p>
            <p className="mt-3 leading-relaxed">
              Les réponses s'appuient sur les fiches patrimoine, les notices de musées et l'agenda
              publiés sur DanXomè. Pour une réservation ferme, passez par la page réservation.
            </p>
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}
