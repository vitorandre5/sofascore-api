import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const host = "0.0.0.0";
const port = env.port;

app.listen(port, host, () => {
  logger.info(`Server listening on http://${host}:${port}`);
  logger.info(`Environment: ${env.nodeEnv}`);
  logger.info(`API prefix: ${env.apiPrefix}`);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", error);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", reason);
});
