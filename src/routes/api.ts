import { Router } from "express";
import {
  getLiveMatches,
  getMatchById,
  getPlayerById,
  getTeamById,
  getTopMatches,
  getTournamentById,
  search,
} from "../controllers/sofaScoreController";
import { asyncHandler } from "../utils/asyncHandler";

export const apiRouter: Router = Router();

apiRouter.get("/matches/live", asyncHandler(getLiveMatches));
apiRouter.get("/matches/top", asyncHandler(getTopMatches));
apiRouter.get("/matches/:id", asyncHandler(getMatchById));
apiRouter.get("/team/:id", asyncHandler(getTeamById));
apiRouter.get("/player/:id", asyncHandler(getPlayerById));
apiRouter.get("/tournament/:id", asyncHandler(getTournamentById));
apiRouter.get("/search", asyncHandler(search));
