import type { CorsOptions } from "cors";

/**
 * When `NODE_ENV === "production"`, only these origins may call the API (comma-separated).
 * Example: CORS_ORIGIN="https://app.example.com,https://www.example.com"
 *
 * In development (anything other than production), we **reflect** the request `Origin`
 * (`origin: true`). That fixes Next.js on 3001, Vite on 5173, etc., without editing .env.
 */
function parseOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const shared: Pick<
  CorsOptions,
  "credentials" | "methods" | "allowedHeaders" | "maxAge" | "optionsSuccessStatus"
> = {
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

export function buildCorsOptions(): CorsOptions {
  const isProd = process.env.NODE_ENV === "production";
  const allowed = parseOrigins();

  if (isProd) {
    if (allowed.length === 0) {
      console.warn(
        "[cors] NODE_ENV=production and CORS_ORIGIN is empty — reflecting request Origin (like dev). " +
          "Set CORS_ORIGIN to an explicit comma-separated allowlist before real production traffic."
      );
      return {
        ...shared,
        origin: true,
      };
    }
    return {
      ...shared,
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowed.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
    };
  }

  // Development / tests: mirror the browser Origin so localhost:3001, 127.0.0.1:3002, etc. all work.
  return {
    ...shared,
    origin: true,
  };
}
