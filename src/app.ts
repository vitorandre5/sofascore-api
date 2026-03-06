import cors from "cors";
import express, { Express, json } from "express";
import openapi from "../openapi.json";
import { env } from "./config/env";
import { apiRateLimiter } from "./middlewares/rateLimiter";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFound";
import { apiRouter } from "./routes/api";
import { docsRouter } from "./routes/docs";
import { healthRouter } from "./routes/health";

const app: Express = express();

const parseCorsOrigins = (value: string): string[] => {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseCorsOrigins(env.corsOrigin);

const corsMiddleware =
  allowedOrigins.length === 1 && allowedOrigins[0] === "*"
    ? cors()
    : cors({
        origin: allowedOrigins,
      });

app.set("x-powered-by", false);
app.set("trust proxy", 1);
app.use(corsMiddleware);
app.use(json());

app.use(env.apiPrefix, apiRateLimiter);
app.use(env.apiPrefix, apiRouter);
app.use("/health", healthRouter);
app.use("/docs", docsRouter);
app.get("/openapi.json", (_req, res) => {
  res.json(openapi);
});

app.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      name: "sofascore-api",
      docs: "/docs",
      openapi: "/openapi.json",
      health: "/health",
      apiPrefix: env.apiPrefix,
    },
    message: "",
    error: null,
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
