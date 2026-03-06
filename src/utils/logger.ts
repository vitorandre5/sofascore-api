const now = (): string => new Date().toISOString();

export const logger = {
  info: (message: string, data?: unknown): void => {
    if (typeof data === "undefined") {
      console.log(`[${now()}] INFO: ${message}`);
      return;
    }

    console.log(`[${now()}] INFO: ${message}`, data);
  },
  error: (message: string, data?: unknown): void => {
    if (typeof data === "undefined") {
      console.error(`[${now()}] ERROR: ${message}`);
      return;
    }

    console.error(`[${now()}] ERROR: ${message}`, data);
  },
};
