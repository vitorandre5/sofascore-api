import { sofaScoreClient } from "../providers/sofaScoreClient";

export const sofaScoreService = {
  getLiveMatches: async (sport = "football"): Promise<unknown> => {
    return sofaScoreClient.get(`/sport/${encodeURIComponent(sport)}/events/live`);
  },
  getMatchById: async (id: string): Promise<unknown> => {
    return sofaScoreClient.get(`/event/${encodeURIComponent(id)}`);
  },
  getTeamById: async (id: string): Promise<unknown> => {
    return sofaScoreClient.get(`/team/${encodeURIComponent(id)}`);
  },
  getPlayerById: async (id: string): Promise<unknown> => {
    return sofaScoreClient.get(`/player/${encodeURIComponent(id)}`);
  },
  getTournamentById: async (id: string): Promise<unknown> => {
    return sofaScoreClient.get(`/unique-tournament/${encodeURIComponent(id)}`);
  },
  search: async (query: string): Promise<unknown> => {
    return sofaScoreClient.get(`/search/all/${encodeURIComponent(query)}`);
  },
};
