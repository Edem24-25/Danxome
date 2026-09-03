import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.kkiapay.me https://widget-v3.kkiapay.me",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.kkiapay.me https://widget-v3.kkiapay.me",
      "font-src 'self' https://fonts.gstatic.com https://widget-v3.kkiapay.me",
      "img-src 'self' data: blob: https://*.supabase.co https://*.kkiapay.me https://widget-v3.kkiapay.me",
      "connect-src 'self' https://*.supabase.co https://*.kkiapay.me https://api.kkiapay.me https://api-sandbox.kkiapay.me https://inspector.kkiapay.me https://widget-v3.kkiapay.me https://accounts.google.com",
      "frame-src 'self' https://*.kkiapay.me https://widget-v3.kkiapay.me",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://*.supabase.co",
    ].join("; "),
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const rawResponse = await handler.fetch(request, env, ctx);
      const response = await normalizeCatastrophicSsrResponse(rawResponse);
      return addSecurityHeaders(response);
    } catch (error) {
      console.error(error);
      const errResponse = new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      return addSecurityHeaders(errResponse);
    }
  },
};
