import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePanier } from "@/hooks/use-data";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const navLinks = [
  { to: "/culture", label: "Culture" },
  { to: "/tourisme", label: "Tourisme" },
  { to: "/art", label: "Art & artisanat" },
  { to: "/evenements", label: "Événements" },
] as const;

export function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <img
        src="/logo.png"
        alt="DanXomè"
        className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
      />
      <span
        className={cn(
          "font-display text-2xl leading-none tracking-tight transition-colors duration-300",
          dark ? "text-ivory" : "text-forest-deep",
        )}
      >
        DanXomè
      </span>
    </Link>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: panierData } = usePanier();
  const nombre = (panierData ?? []).reduce((s, i) => s + i.qte, 0);
  const { user, profile, loading, peutCommander } = useAuth();
  const accueil = "/profil";
  const rafRef = useRef<number>(0);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setScrolled(window.scrollY > 24);
    });
  }, []);

  useEffect(() => {
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm"
          : "border-b border-transparent bg-background",
      )}
    >
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:h-18 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Wordmark />
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeProps={{ className: "text-forest-deep bg-forest/5" }}
                className="cultural-underline relative rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-all duration-300 hover:text-forest-deep hover:bg-forest/5"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Rechercher"
            className="rounded-full"
          >
            <Link to="/tourisme">
              <Search className="size-[18px]" />
            </Link>
          </Button>
          {peutCommander && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Panier"
              className="relative rounded-full"
            >
              <Link to="/art/panier">
                <ShoppingCart className="size-[18px]" />
                {nombre > 0 && (
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {nombre}
                  </span>
                )}
              </Link>
            </Button>
          )}
          {user && !loading ? (
            <Button asChild variant="gold" size="sm" className="hidden rounded-full sm:inline-flex">
              <Link to={accueil}>Mon espace</Link>
            </Button>
          ) : (
            <Button asChild variant="gold" size="sm" className="hidden rounded-full sm:inline-flex">
              <Link to="/auth/login" search={{ from: undefined }}>
                <User /> Connexion
              </Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full lg:hidden"
                aria-label="Menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm border-l-border/50 p-0">
              <div className="flex h-full flex-col">
                {/* Header mobile */}
                <div className="border-b border-border/50 px-6 py-4">
                  <Wordmark />
                </div>

                {/* Navigation mobile */}
                <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
                  {navLinks.map((l, i) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-3 rounded-lg border-b-0 px-4 py-3.5 font-display text-lg text-forest-deep transition-all duration-300 hover:bg-forest/5 hover:pl-6"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span className="size-1.5 rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-100" />
                      {l.label}
                    </Link>
                  ))}
                  <div className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  {peutCommander && (
                    <Link
                      to="/art/panier"
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-3 rounded-lg px-4 py-3.5 font-display text-lg text-forest-deep transition-all duration-300 hover:bg-forest/5 hover:pl-6"
                    >
                      <span className="size-1.5 rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-100" />
                      Panier
                      {nombre > 0 && (
                        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                          {nombre}
                        </span>
                      )}
                    </Link>
                  )}
                  {user && !loading && (
                    <Link
                      to={accueil}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-3 rounded-lg px-4 py-3.5 font-display text-lg text-forest-deep transition-all duration-300 hover:bg-forest/5 hover:pl-6"
                    >
                      <span className="size-1.5 rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-100" />
                      Mon espace
                    </Link>
                  )}
                </nav>

                {/* Footer mobile */}
                <div className="border-t border-border/50 px-6 py-6">
                  <Button asChild variant="gold" size="lg" className="w-full rounded-full">
                    <Link to="/auth/login" search={{ from: undefined }} onClick={() => setOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
