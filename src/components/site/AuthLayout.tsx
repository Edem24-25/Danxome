import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { images } from "@/lib/data";
import { Wordmark } from "./Header";

export function AuthLayout({
  eyebrow,
  titre,
  intro,
  children,
  footer,
}: {
  eyebrow: string;
  titre: string;
  intro: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Colonne image — parallax immersif avec animations */}
      <div className="relative hidden isolate flex-col justify-between overflow-hidden p-10 lg:flex">
        <img
          src={images.heroAbomey}
          alt="Bas-reliefs du palais royal d'Abomey"
          className="media-warm absolute inset-0 size-full object-cover animate-[scale_20s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-forest-deep/60" />
        <div className="absolute inset-0 pattern-fon opacity-20" aria-hidden />
        <div className="absolute inset-0 texture-grain" aria-hidden />

        {/* Gradient décoratif animé */}
        <div
          className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(ellipse at 30% 70%, oklch(0.735 0.146 82.6 / 0.2), transparent 60%)",
          }}
          aria-hidden
        />

        {/* Motifs flottants */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-20 top-1/4 size-40 rounded-full bg-accent/10 blur-3xl animate-[float_6s_ease-in-out_infinite]" />
          <div className="absolute -right-20 bottom-1/4 size-32 rounded-full bg-terracotta/10 blur-3xl animate-[float_8s_ease-in-out_infinite_1s]" />
        </div>

        <div className="relative z-10">
          <Wordmark dark />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-ivory/20 bg-ivory/10 backdrop-blur-sm">
            <span className="text-2xl">🏛️</span>
          </div>
          <p className="font-display text-4xl leading-tight text-ivory drop-shadow-lg">
            « Celui qui connaît le chemin de la maison des ancêtres ne se perd jamais. »
          </p>
          <p className="mt-4 text-sm text-ivory/60">— Proverbe fon</p>

          {/* Indicateur de navigation */}
          <div className="mt-10 flex gap-2">
            <div className="h-1 w-8 rounded-full bg-accent" />
            <div className="h-1 w-2 rounded-full bg-ivory/30" />
            <div className="h-1 w-2 rounded-full bg-ivory/30" />
          </div>
        </div>
      </div>

      {/* Colonne formulaire avec design amélioré */}
      <div className="flex flex-col justify-center px-5 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Wordmark />
          </div>

          {/* En-tête animé */}
          <div className="mt-8 space-y-4 lg:mt-0">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="font-display text-4xl text-forest-deep transition-colors duration-300 hover:text-terracotta">
              {titre}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">{intro}</p>
          </div>

          {/* Ligne décorative */}
          <div className="my-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="space-y-6">{children}</div>

          {/* Footer avec séparateur */}
          <div className="mt-10 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link
              to="/legal"
              className="underline-offset-4 transition-colors hover:text-forest hover:underline"
            >
              Conditions & confidentialité
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
