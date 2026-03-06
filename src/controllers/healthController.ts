import { Request, Response } from "express";
import { env } from "../config/env";
import { sendSuccess } from "../utils/response";

export const getHealth = (_req: Request, res: Response): Response => {
  return sendSuccess(res, {
    status: "ok",
    uptime: process.uptime(),
    nodeEnv: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
};
