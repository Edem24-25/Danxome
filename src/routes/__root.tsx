import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
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

import illustration404 from "../assets/illustration-404.jpg";
import { SiteShell } from "../components/site/SiteShell";
import { ScrollToTop } from "../components/site/ScrollToTop";
import { Button } from "../components/ui/button";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <SiteShell>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="overflow-hidden rounded-lg border border-border">
          <img
            src={illustration404}
            alt="Voyageuse à la lanterne, tenture appliquée du Dãhomè"
            width={1024}
            height={1024}
            className="media-warm w-full"
          />
        </div>
        <div>
          <p className="eyebrow">Erreur 404</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] text-forest-deep sm:text-6xl">
            La piste s'arrête ici
          </h1>
          <p className="mt-5 max-w-md text-muted-foreground">
            Comme le voyageur d'Abomey privé de sa lanterne, cette page n'existe plus ou n'a jamais
            été. Reprenons le chemin ensemble.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/tourisme">Explorer les sites</Link>
            </Button>
          </div>
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
      {
        name: "content-security-policy",
        content:
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { name: "x-content-type-options", content: "nosniff" },
      { name: "x-frame-options", content: "DENY" },
      { name: "x-xss-protection", content: "1; mode=block" },
      { title: "Dãhomè — Patrimoine, art et tourisme du Bénin" },
      {
        name: "description",
        content:
          "Plateforme immersive du patrimoine béninois : royaumes, musées, visites virtuelles, artisans et agenda culturel.",
      },
      { name: "author", content: "Dãhomè" },
      { property: "og:title", content: "Dãhomè — Patrimoine, art et tourisme du Bénin" },
      {
        property: "og:description",
        content: "Royaumes, musées, visites virtuelles, artisans et agenda culturel du Bénin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
