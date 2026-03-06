type NodeEnv = "development" | "production" | "test";

const parseNumberEnv = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  port: parseNumberEnv(process.env.PORT, 8080),
  nodeEnv: (process.env.NODE_ENV ?? "development") as NodeEnv,
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  apiPrefix: process.env.API_PREFIX ?? "/api",
  requestTimeout: parseNumberEnv(process.env.REQUEST_TIMEOUT, 10000),
  sofaScoreBaseUrl: "https://api.sofascore.com/api/v1",
  rateLimitWindowMs: 60_000,
  rateLimitMaxRequests: 300,
};
