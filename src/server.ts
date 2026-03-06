import { app } from "./app";
import { env } from "./config/env";
import { sofaScoreService } from "./services/sofaScoreService";
import { logger } from "./utils/logger";

const host = "0.0.0.0";
const port = env.port;

sofaScoreService.startTopMatchesPreload("football").catch((error) => {
  logger.error("Failed to start top matches preload", error);
});

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
