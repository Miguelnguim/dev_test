/**
 * Validates request origins for both the HTTP CORS middleware and the Socket.IO gateway.
 *
 * FRONTEND_URL can hold one or several comma-separated origins (useful when Vercel generates
 * both a short production domain and a git-branch preview domain for the same deployment).
 * Any *.vercel.app origin is also allowed, since Vercel issues a new URL per branch/preview —
 * requiring a manual FRONTEND_URL update for every new preview link isn't practical for a demo
 * project. Reads process.env on every call (not at import time) so it always reflects whatever
 * was loaded from .env by the time the app is actually handling requests.
 */
const ALWAYS_ALLOWED = new Set(['http://localhost:3000']);
const VERCEL_ORIGIN_PATTERN = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;

export function corsOriginValidator(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
): void {
  // Requests without an Origin header (server-to-server, curl, health checks) are allowed.
  if (!origin) {
    callback(null, true);
    return;
  }

  const allowedFromEnv = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  if (ALWAYS_ALLOWED.has(origin) || allowedFromEnv.includes(origin)) {
    callback(null, true);
    return;
  }

  if (VERCEL_ORIGIN_PATTERN.test(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin ${origin} not allowed by CORS`), false);
}
