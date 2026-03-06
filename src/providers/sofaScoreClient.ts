import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

export class SofaScoreClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(baseUrl: string, timeoutMs: number) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }

  public async get<T>(path: string): Promise<T> {
    const endpoint = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new HttpError(
          502,
          `SofaScore request failed with status ${response.status}`,
          "SOFASCORE_BAD_RESPONSE"
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as { name: string }).name === "AbortError"
      ) {
        throw new HttpError(504, "SofaScore request timeout", "SOFASCORE_TIMEOUT");
      }

      throw new HttpError(502, "Unable to reach SofaScore", "SOFASCORE_UNAVAILABLE");
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const sofaScoreClient = new SofaScoreClient(
  env.sofaScoreBaseUrl,
  env.requestTimeout
);
