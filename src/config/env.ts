type NodeEnv = "development" | "production" | "test";

const parseNumberEnv = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseCsvEnv = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const env = {
  port: parseNumberEnv(process.env.PORT, 8080),
  nodeEnv: (process.env.NODE_ENV ?? "development") as NodeEnv,
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  apiPrefix: process.env.API_PREFIX ?? "/api",
  requestTimeout: parseNumberEnv(process.env.REQUEST_TIMEOUT, 10000),
  sofaScoreBaseUrl: "https://api.sofascore.com/api/v1",
  sofaScoreFallbackBaseUrls: parseCsvEnv(process.env.SOFASCORE_FALLBACK_BASE_URLS),
  upstreamRetries: parseNumberEnv(process.env.UPSTREAM_RETRIES, 3),
  upstreamRetryBackoffMs: parseNumberEnv(process.env.UPSTREAM_RETRY_BACKOFF_MS, 300),
  topMatchesLimit: parseNumberEnv(process.env.TOP_MATCHES_LIMIT, 50),
  preloadIntervalMs: parseNumberEnv(process.env.PRELOAD_INTERVAL_MS, 30000),
  rateLimitWindowMs: 60_000,
  rateLimitMaxRequests: 300,
};
