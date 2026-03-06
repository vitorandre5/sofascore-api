import { Request, Response } from "express";
import { sendError } from "../utils/response";

export const notFoundHandler = (req: Request, res: Response): Response => {
  return sendError(res, `Route not found: ${req.method} ${req.path}`, "NOT_FOUND", 404);
};
