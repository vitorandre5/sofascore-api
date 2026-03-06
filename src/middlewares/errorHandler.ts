import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import { logger } from "../utils/logger";
import { sendError } from "../utils/response";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (error instanceof HttpError) {
    logger.error(`${req.method} ${req.path} -> ${error.message}`);
    return sendError(res, error.message, error.errorCode, error.statusCode);
  }

  logger.error(`${req.method} ${req.path} -> unexpected error`, error);
  return sendError(res, "Internal server error", "INTERNAL_ERROR", 500);
};
