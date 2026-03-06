import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

export class SofaScoreClient {
  private readonly baseUrls: string[];
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly retryBackoffMs: number;

  constructor(baseUrl: string, timeoutMs: number, fallbackBaseUrls: string[]) {
    this.baseUrls = [baseUrl, ...fallbackBaseUrls].filter(Boolean);
    this.timeoutMs = timeoutMs;
    this.retries = env.upstreamRetries;
    this.retryBackoffMs = env.upstreamRetryBackoffMs;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isRetryableStatus(status: number): boolean {
    return status === 403 || status === 429 || status >= 500;
  }

  private async fetchJson<T>(endpoint: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Origin: "https://www.sofascore.com",
          Referer: "https://www.sofascore.com/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
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
      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        (error as { name: string }).name === "AbortError"
      ) {
        throw new HttpError(504, "SofaScore request timeout", "SOFASCORE_TIMEOUT");
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  public async get<T>(path: string): Promise<T> {
    let lastError: unknown = null;

    for (const baseUrl of this.baseUrls) {
      const endpoint = `${baseUrl}${path}`;

      for (let attempt = 1; attempt <= this.retries; attempt += 1) {
        try {
          return await this.fetchJson<T>(endpoint);
        } catch (error) {
          lastError = error;

          if (error instanceof HttpError) {
            const status = Number(error.message.match(/status\s(\d+)/)?.[1] ?? 0);
            const retryable = this.isRetryableStatus(status);
            const hasMoreAttempts = attempt < this.retries;

            if (retryable && hasMoreAttempts) {
              await SofaScoreClient.sleep(this.retryBackoffMs * attempt);
              continue;
            }

            break;
          }

          const hasMoreAttempts = attempt < this.retries;
          if (hasMoreAttempts) {
            await SofaScoreClient.sleep(this.retryBackoffMs * attempt);
            continue;
          }

          break;
        }
      }
    }

    if (lastError instanceof HttpError) {
      throw lastError;
    }

    throw new HttpError(502, "Unable to reach SofaScore", "SOFASCORE_UNAVAILABLE");
  }
}

export const sofaScoreClient = new SofaScoreClient(
  env.sofaScoreBaseUrl,
  env.requestTimeout,
  env.sofaScoreFallbackBaseUrls
);
