import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { sites } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Carte stylisée du Bénin avec pins animés et tooltips interactifs. */
export function BeninMap({ className, actifs }: { className?: string; actifs?: string[] }) {
  const visibles = actifs ? sites.filter((s) => actifs.includes(s.type)) : sites;
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-forest-deeper shadow-relief",
        className,
      )}
    >
      {/* Motifs de fond */}
      <div className="pattern-fon absolute inset-0 opacity-15" aria-hidden />
      <div className="absolute inset-0 texture-grain" aria-hidden />

      {/* Gradient decoratif */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, oklch(0.435 0.101 165.6 / 0.4), transparent 70%)",
        }}
        aria-hidden
      />

      <svg viewBox="0 0 100 130" className="relative h-full w-full" role="img" aria-label="Bénin">
        {/* Ombre de la carte */}
        <path
          d="M32 4 L60 6 L64 20 L58 30 L62 44 L56 58 L60 72 L52 86 L56 100 L48 116 L40 126 L30 118 L26 100 L20 84 L24 66 L18 50 L22 34 L26 18 Z"
          fill="oklch(0.2 0.04 160 / 0.3)"
          stroke="none"
          transform="translate(1, 1)"
        />
        {/* Carte principale */}
        <path
          d="M32 4 L60 6 L64 20 L58 30 L62 44 L56 58 L60 72 L52 86 L56 100 L48 116 L40 126 L30 118 L26 100 L20 84 L24 66 L18 50 L22 34 L26 18 Z"
          fill="oklch(0.435 0.101 165.6 / 0.5)"
          stroke="oklch(0.735 0.146 82.6 / 0.5)"
          strokeWidth="0.5"
        />
        {/* Lignes internes décoratives */}
        <path
          d="M38 20 L52 35 L48 55 L42 75 L38 95"
          fill="none"
          stroke="oklch(0.735 0.146 82.6 / 0.15)"
          strokeWidth="0.3"
          strokeDasharray="2 3"
        />
      </svg>

      {/* Pins avec animation */}
      {visibles.map((s) => (
        <Link
          key={s.slug}
          to="/tourisme/sites/$slug"
          params={{ slug: s.slug }}
          style={{ left: `${s.coords.x}%`, top: `${s.coords.y}%` }}
          className="group absolute -translate-x-1/2 -translate-y-full"
          onMouseEnter={() => setHovered(s.slug)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Pulse ring */}
          <span className="absolute -inset-2 rounded-full bg-accent/20 animate-pulse-gold" />

          {/* Tooltip */}
          <span
            className={cn(
              "absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ivory px-3 py-1.5 text-xs font-bold text-forest-deep shadow-lg transition-all duration-300",
              hovered === s.slug
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-1 pointer-events-none",
            )}
          >
            {s.nom}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 rotate-45 bg-ivory" />
          </span>

          {/* Pin */}
          <span className="relative flex flex-col items-center">
            <MapPin
              className={cn(
                "size-6 text-forest-deep transition-all duration-300",
                "fill-accent group-hover:-translate-y-1 group-hover:scale-110",
              )}
            />
          </span>
        </Link>
      ))}
    </div>
  );
}
