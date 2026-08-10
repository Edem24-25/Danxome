import { Link } from "@tanstack/react-router";
import { Star, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  to: string;
  params?: Record<string, string>;
  image: string;
  titre: string;
  meta: string;
  resume?: string;
  tag?: string;
  note?: number;
  footer?: string;
  ratio?: "portrait" | "paysage" | "carre";
  className?: string;
};

const ratios = {
  portrait: "aspect-[3/4]",
  paysage: "aspect-[4/3]",
  carre: "aspect-square",
};

/** Carte de contenu réutilisable : site, artiste, œuvre, événement, musée. */
export function ContentCard({
  to,
  params,
  image,
  titre,
  meta,
  resume,
  tag,
  note,
  footer,
  ratio = "paysage",
  className,
}: Props) {
  return (
    <Link
      to={to}
      params={params as never}
      className={cn(
        "group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-500",
        "hover:-translate-y-1 hover:shadow-cultural hover:border-accent/30",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden", ratios[ratio])}>
        <img
          src={image}
          alt={titre}
          loading="lazy"
          className="media-warm size-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
        {/* Overlay gradient enrichi */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

        {/* Pattern overlay subtil */}
        <div className="absolute inset-0 pattern-dots opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Badge tag */}
        {tag && (
          <Badge
            variant="onDark"
            className="absolute top-3 left-3 transition-transform duration-300 group-hover:scale-105"
          >
            {tag}
          </Badge>
        )}

        {/* Note / rating */}
        {note !== undefined && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-ivory/90 px-2.5 py-1 text-xs font-bold text-forest-deep shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
            <Star className="size-3 fill-accent text-accent" />
            {note.toFixed(1)}
          </div>
        )}

        {/* Arrow indicator */}
        <div className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground opacity-0 shadow-gold transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
          <ArrowUpRight className="size-4" />
        </div>
      </div>

      <div className="p-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-terracotta uppercase transition-colors group-hover:text-terracotta-deep">
          {meta}
        </p>
        <h3 className="mt-2 font-display text-xl leading-snug text-forest-deep transition-colors group-hover:text-forest">
          {titre}
        </h3>
        {resume && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {resume}
          </p>
        )}
        {footer && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-sm font-semibold text-forest transition-colors group-hover:text-forest-light">
              {footer}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
