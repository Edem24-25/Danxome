import { Link } from "@tanstack/react-router";
import { LogOut, PanelLeftClose, PanelLeft, ArrowUpRight } from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Breadcrumbs, type Crumb } from "./Bits";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }> };

export function DashboardShell({
  space,
  items,
  title,
  crumbs,
  actions,
  children,
}: {
  space: string;
  items: NavItem[];
  title: string;
  crumbs: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col justify-between bg-sidebar text-sidebar-foreground transition-[width] duration-300 md:flex",
          open ? "w-64" : "w-16",
        )}
      >
        {/* Motif de fond */}
        <div className="pattern-fon absolute inset-0 opacity-[0.04]" aria-hidden />

        <div className="relative">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo-danxome.svg" alt="DanXomè" className="h-8 w-auto" />
            </Link>
          </div>
          <p
            className={cn(
              "px-4 pt-5 pb-2 text-[10px] font-bold tracking-[0.2em] text-sidebar-primary uppercase",
              !open && "opacity-0",
            )}
          >
            {space}
          </p>
          <nav className="space-y-0.5 px-2">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                activeProps={{
                  className: "bg-sidebar-accent text-sidebar-accent-foreground",
                }}
                className="group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm text-sidebar-foreground/75 transition-all duration-200 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              >
                <item.icon className="size-4 shrink-0 transition-colors group-hover:text-sidebar-primary" />
                {open && <span className="truncate">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="relative space-y-1 border-t border-sidebar-border p-2">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60"
          >
            {open ? <PanelLeftClose className="size-4" /> : <PanelLeft className="size-4" />}
            {open && "Réduire"}
          </button>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60"
          >
            <LogOut className="size-4" />
            {open && "Déconnexion"}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6">
            <div className="min-w-0">
              <Breadcrumbs items={crumbs} />
              <h1 className="mt-1 truncate font-display text-2xl text-forest-deep">{title}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden rounded-full sm:inline-flex"
              >
                <Link to="/">
                  Voir le site <ArrowUpRight />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-secondary/30 px-3 py-2 md:hidden">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-forest text-primary-foreground" }}
              className="rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-foreground/70 transition-colors hover:bg-forest/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-6 sm:px-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
