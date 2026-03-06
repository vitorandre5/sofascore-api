import { Request, Response } from "express";
import { sofaScoreService } from "../services/sofaScoreService";
import { HttpError } from "../utils/httpError";
import { sendSuccess } from "../utils/response";

const readId = (req: Request): string => {
  const { id } = req.params;
  if (!id) {
    throw new HttpError(400, "Missing route param: id", "INVALID_ID");
  }

  return id;
};

export const getLiveMatches = async (req: Request, res: Response): Promise<Response> => {
  const sport = typeof req.query.sport === "string" ? req.query.sport : "football";
  const data = await sofaScoreService.getLiveMatches(sport);
  return sendSuccess(res, data);
};

export const getTopMatches = async (req: Request, res: Response): Promise<Response> => {
  const sport = typeof req.query.sport === "string" ? req.query.sport : "football";
  const limitParam = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
  const refresh = req.query.refresh === "true";
  const limit = Number.isFinite(limitParam) && (limitParam as number) > 0 ? Number(limitParam) : undefined;

  const data = await sofaScoreService.getTopMatches({
    sport,
    limit,
    refresh,
  });

  return sendSuccess(res, data);
};

export const getMatchById = async (req: Request, res: Response): Promise<Response> => {
  const data = await sofaScoreService.getMatchById(readId(req));
  return sendSuccess(res, data);
};

export const getTeamById = async (req: Request, res: Response): Promise<Response> => {
  const data = await sofaScoreService.getTeamById(readId(req));
  return sendSuccess(res, data);
};

export const getPlayerById = async (req: Request, res: Response): Promise<Response> => {
  const data = await sofaScoreService.getPlayerById(readId(req));
  return sendSuccess(res, data);
};

export const getTournamentById = async (req: Request, res: Response): Promise<Response> => {
  const data = await sofaScoreService.getTournamentById(readId(req));
  return sendSuccess(res, data);
};

export const search = async (req: Request, res: Response): Promise<Response> => {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (!query) {
    throw new HttpError(400, "Query param q is required", "INVALID_QUERY");
  }

  const data = await sofaScoreService.search(query);
  return sendSuccess(res, data);
};
