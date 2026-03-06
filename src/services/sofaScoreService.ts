import { sofaScoreClient } from "../providers/sofaScoreClient";
import { env } from "../config/env";

type SofaScoreEvent = {
  id?: number;
  slug?: string;
  startTimestamp?: number;
  status?: {
    type?: string;
    description?: string;
  };
  tournament?: {
    priority?: number;
    uniqueTournament?: {
      userCount?: number;
      name?: string;
    };
  };
  homeTeam?: {
    name?: string;
  };
  awayTeam?: {
    name?: string;
  };
};

type EventsResponse = {
  events?: SofaScoreEvent[];
};

const topMatchesCache: {
  date: string;
  sport: string;
  matches: SofaScoreEvent[];
  updatedAt: string | null;
  lastError: string | null;
  timer: NodeJS.Timeout | null;
} = {
  date: "",
  sport: "football",
  matches: [],
  updatedAt: null,
  lastError: null,
  timer: null,
};

const LIVE_TYPES = new Set(["inprogress", "live"]);

const toDateKey = (): string => {
  return new Date().toISOString().slice(0, 10);
};

const normalizeEvents = (input: unknown): SofaScoreEvent[] => {
  if (!input || typeof input !== "object") {
    return [];
  }

  const value = input as EventsResponse;
  return Array.isArray(value.events) ? value.events : [];
};

const scoreEvent = (event: SofaScoreEvent): number => {
  const isLive = LIVE_TYPES.has(event.status?.type ?? "") ? 1_000_000_000 : 0;
  const userCount = event.tournament?.uniqueTournament?.userCount ?? 0;
  const priority = event.tournament?.priority ?? 9_999;
  const startTimestamp = event.startTimestamp ?? 0;

  // Higher score first: live matches, then league popularity, then tournament priority.
  return isLive + userCount * 1000 - priority * 10 - Math.floor(startTimestamp / 3600);
};

const refreshTopMatches = async (
  sport = "football",
  limit = env.topMatchesLimit
): Promise<void> => {
  const date = toDateKey();
  const encodedSport = encodeURIComponent(sport);

  const [scheduledRaw, liveRaw] = await Promise.all([
    sofaScoreClient.get<EventsResponse>(`/sport/${encodedSport}/scheduled-events/${date}`),
    sofaScoreClient.get<EventsResponse>(`/sport/${encodedSport}/events/live`),
  ]);

  const merged = [...normalizeEvents(liveRaw), ...normalizeEvents(scheduledRaw)];
  const uniqueById = new Map<number, SofaScoreEvent>();

  for (const event of merged) {
    const id = event.id;
    if (typeof id !== "number") {
      continue;
    }

    if (!uniqueById.has(id)) {
      uniqueById.set(id, event);
    }
  }

  const sorted = Array.from(uniqueById.values())
    .sort((a, b) => scoreEvent(b) - scoreEvent(a))
    .slice(0, Math.max(1, limit));

  topMatchesCache.date = date;
  topMatchesCache.sport = sport;
  topMatchesCache.matches = sorted;
  topMatchesCache.updatedAt = new Date().toISOString();
  topMatchesCache.lastError = null;
};

const ensureTopMatchesCache = async (sport = "football", limit = env.topMatchesLimit): Promise<void> => {
  const date = toDateKey();
  const staleByDate = topMatchesCache.date !== date;
  const staleBySport = topMatchesCache.sport !== sport;
  const empty = topMatchesCache.matches.length === 0;

  if (staleByDate || staleBySport || empty) {
    await refreshTopMatches(sport, limit);
  }
};

export const sofaScoreService = {
  startTopMatchesPreload: async (sport = "football"): Promise<void> => {
    if (topMatchesCache.timer) {
      return;
    }

    try {
      await refreshTopMatches(sport, env.topMatchesLimit);
    } catch (error) {
      topMatchesCache.lastError = error instanceof Error ? error.message : "Unknown preload error";
    }

    topMatchesCache.timer = setInterval(() => {
      refreshTopMatches(sport, env.topMatchesLimit).catch((error) => {
        topMatchesCache.lastError =
          error instanceof Error ? error.message : "Unknown preload error";
      });
    }, env.preloadIntervalMs);
  },
  getLiveMatches: async (sport = "football"): Promise<unknown> => {
    return sofaScoreClient.get(`/sport/${encodeURIComponent(sport)}/events/live`);
  },
  getTopMatches: async (
    options?: {
      sport?: string;
      limit?: number;
      refresh?: boolean;
    }
  ): Promise<unknown> => {
    const sport = options?.sport ?? "football";
    const limit = Math.max(1, options?.limit ?? env.topMatchesLimit);

    if (options?.refresh) {
      await refreshTopMatches(sport, limit);
    } else {
      await ensureTopMatchesCache(sport, limit);
    }

    return {
      sport,
      date: topMatchesCache.date,
      limit,
      updatedAt: topMatchesCache.updatedAt,
      preloadIntervalMs: env.preloadIntervalMs,
      total: topMatchesCache.matches.length,
      matches: topMatchesCache.matches.slice(0, limit),
      lastError: topMatchesCache.lastError,
    };
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
    const encodedQuery = encodeURIComponent(query);

    try {
      return await sofaScoreClient.get(`/search/multi?q=${encodedQuery}`);
    } catch {
      // Fallback kept for compatibility when multi route changes upstream.
      return sofaScoreClient.get(`/search/${encodedQuery}`);
    }
  },
};
