import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../contexts/auth";

import { Compass, MapPin } from "lucide-react";
import { SiteShell } from "../components/site/SiteShell";
import { ScrollToTop } from "../components/site/ScrollToTop";
import { PageTransition } from "../components/site/PageTransition";
import { Button } from "../components/ui/button";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <SiteShell>
      <div className="mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="relative mb-8">
          <div className="absolute -inset-6 rounded-full bg-gold/10 blur-2xl" />
          <div className="relative flex items-center justify-center gap-3 rounded-full border border-border bg-card px-6 py-4 shadow-sm">
            <Compass className="size-10 text-terracotta" strokeWidth={1.5} />
            <MapPin className="size-8 text-forest animate-bounce-in" strokeWidth={1.5} />
          </div>
        </div>
        <p className="eyebrow">Erreur 404</p>
        <h1 className="mt-3 font-display text-5xl leading-[1.05] text-forest-deep sm:text-6xl">
          La piste s'arrête ici
        </h1>
        <p className="mt-5 max-w-lg text-muted-foreground">
          Comme le voyageur d'Abomey privé de sa lanterne, cette page n'existe plus ou n'a jamais
          été. Reprenons le chemin ensemble.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="gold" className="rounded-full">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/tourisme">Explorer les sites</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DanXomè — Patrimoine, art et tourisme du Bénin" },
      {
        name: "description",
        content:
          "Plateforme immersive du patrimoine béninois : royaumes, musées, visites virtuelles, artisans et agenda culturel.",
      },
      { name: "author", content: "DanXomè" },
      { property: "og:title", content: "DanXomè — Patrimoine, art et tourisme du Bénin" },
      {
        property: "og:description",
        content: "Royaumes, musées, visites virtuelles, artisans et agenda culturel du Bénin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/logo-danxome.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700&display=swap",
        crossOrigin: "anonymous",
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ScrollToTop />
        <PageTransition />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
