import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------- Breadcrumbs ---------- */

export type Crumb = { label: string; to?: string };

export function Breadcrumbs({ items, dark = false }: { items: Crumb[]; dark?: boolean }) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-xs",
        dark ? "text-ivory/60" : "text-muted-foreground",
      )}
    >
      <Link
        to="/"
        className={cn(
          "transition-colors duration-200",
          dark ? "hover:text-accent" : "hover:text-forest",
        )}
      >
        Accueil
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="size-3 opacity-40" />
          {item.to ? (
            <Link
              to={item.to}
              className={cn(
                "transition-colors duration-200",
                dark ? "hover:text-accent" : "hover:text-forest",
              )}
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn("font-semibold", dark ? "text-ivory" : "text-foreground")}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ---------- Page header ---------- */

export function PageHead({
  eyebrow,
  title,
  intro,
  crumbs,
  aside,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  crumbs: Crumb[];
  aside?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-secondary/30">
      {/* Motifs décoratifs */}
      <div className="pattern-fon absolute inset-0 opacity-[0.25]" aria-hidden />
      <div className="absolute inset-0 texture-grain" aria-hidden />

      {/* Gradient décoratif */}
      <div
        className="absolute top-0 left-0 h-full w-1/3"
        style={{
          background:
            "radial-gradient(ellipse at 0% 0%, oklch(0.735 0.146 82.6 / 0.06), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 sm:pt-10 sm:pb-16 lg:px-8">
        <Breadcrumbs items={crumbs} />
        <div className="mt-7 grid items-end gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] text-forest-deep sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            {intro && (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {intro}
              </p>
            )}
          </div>
          {aside && <div className="lg:justify-self-end">{aside}</div>}
        </div>
      </div>
    </section>
  );
}

/* ---------- Section title ---------- */

export function SectionTitle({
  eyebrow,
  title,
  intro,
  action,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  action?: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="grid items-end gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        {eyebrow && <p className={cn(dark ? "eyebrow-gold" : "eyebrow")}>{eyebrow}</p>}
        <h2
          className={cn(
            "mt-3 font-display text-3xl leading-tight sm:text-4xl",
            dark ? "text-ivory" : "text-forest-deep",
          )}
        >
          {title}
        </h2>
        {intro && (
          <p
            className={cn(
              "mt-3 max-w-2xl text-sm leading-relaxed",
              dark ? "text-ivory/60" : "text-muted-foreground",
            )}
          >
            {intro}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ---------- Divider ---------- */

export function Rule({ className }: { className?: string }) {
  return <div className={cn("rule-adinkra my-16", className)} aria-hidden />;
}

/* ---------- Empty / loading / error states ---------- */

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="pattern-fon absolute inset-0 opacity-20" aria-hidden />
      <div className="absolute inset-0 texture-grain" aria-hidden />
      <div className="relative mx-auto max-w-md">
        {icon && (
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-secondary text-forest shadow-relief">
            {icon}
          </div>
        )}
        <h3 className="font-display text-xl text-forest-deep">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-cultural h-16"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

/* ---------- KPI ---------- */

export function StatCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-md hover:border-accent/20">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
        {icon && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl text-forest-deep">{value}</p>
      {delta && <p className="mt-1 text-xs font-medium text-forest">{delta}</p>}
    </div>
  );
}
