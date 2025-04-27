import { z } from "zod";
import { OpenRouterError, OpenRouterAPIError, OpenRouterValidationError } from "./openrouter.types";
import type { ModelParams, ConfigOptions, RequestPayload, Response, RetryConfig } from "./openrouter.types";
import { OPENROUTER_API_KEY, OPENROUTER_API_URL } from "astro:env/server";

export class OpenRouterService {
  // Pola publiczne
  public readonly apiUrl: string;
  public readonly apiKey: string;
  public modelName: string;
  public modelParams: ModelParams;
  public systemMessage: string;
  public responseFormat?: ConfigOptions["responseFormat"];

  // Pola prywatne
  private _responseSchema: z.ZodType;
  private _retryConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffFactor: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  };

  constructor(responseSchema: z.ZodType) {
    // Inicjalizacja z zmiennych środowiskowych
    this.apiUrl = OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions";
    this.apiKey = OPENROUTER_API_KEY;

    if (!this.apiKey) {
      throw new OpenRouterError("OPENROUTER_API_KEY is required but not provided in environment variables");
    }

    // Domyślna konfiguracja
    this.modelName = "openai/gpt-4o-mini";
    this.modelParams = {
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
    };
    this.systemMessage = "";
    this._responseSchema = responseSchema;
  }

  private async _validateResponse(data: unknown): Promise<Response> {
    try {
      if (!data || typeof data !== "object") {
        throw new OpenRouterError("Response data is empty or not an object");
      }

      const validatedResponse = this._responseSchema.parse(data);

      return validatedResponse;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new OpenRouterValidationError(error);
      }
      throw error;
    }
  }

  private async _handleError(error: unknown): Promise<never> {
    console.error("OpenRouter service error:", error);

    if (error instanceof OpenRouterAPIError) {
      if (error.status === 429) {
        throw new OpenRouterError("Rate limit exceeded. Please try again later.");
      }
      if (error.status === 401 || error.status === 403) {
        throw new OpenRouterError("Authentication failed. Please check your API key.");
      }
      throw error;
    }

    if (error instanceof OpenRouterValidationError) {
      throw error;
    }

    throw new OpenRouterError(error instanceof Error ? error.message : "An unknown error occurred");
  }

  private _prepareRequest(userMessage: string): RequestPayload {
    const messages = [
      {
        role: "system" as const,
        content: this.systemMessage,
      },
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    const payload: RequestPayload = {
      messages,
      model: this.modelName,
      ...this.modelParams,
    };

    if (this.responseFormat) {
      payload.response_format = this.responseFormat;
    }

    return payload;
  }

  private async _executeWithRetry<T>(operation: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof OpenRouterAPIError &&
        this._retryConfig.retryableStatusCodes.includes(error.status) &&
        attempt < this._retryConfig.maxAttempts
      ) {
        const delayMs = Math.min(
          this._retryConfig.initialDelayMs * Math.pow(this._retryConfig.backoffFactor, attempt - 1),
          this._retryConfig.maxDelayMs
        );

        console.warn(
          `Retry attempt ${attempt}/${this._retryConfig.maxAttempts} after ${delayMs}ms for status ${error.status}`
        );

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this._executeWithRetry(operation, attempt + 1);
      }

      throw error;
    }
  }

  public configure(options: ConfigOptions): void {
    if (options.modelName) {
      this.modelName = options.modelName;
    }

    if (options.modelParams) {
      this.modelParams = {
        ...this.modelParams,
        ...options.modelParams,
      };
    }

    if (options.systemMessage) {
      this.systemMessage = options.systemMessage;
    }

    if (options.responseFormat) {
      this.responseFormat = options.responseFormat;
    }

    if (options.retryConfig) {
      this._retryConfig = {
        ...this._retryConfig,
        ...options.retryConfig,
      };
    }
  }

  public async sendMessage(userMessage: string): Promise<Response> {
    try {
      const payload = this._prepareRequest(userMessage);

      const makeRequest = async () => {
        const response = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new OpenRouterAPIError(response.status, response.statusText, await response.text());
        }

        const data = await response.json();
        return await this._validateResponse(data);
      };

      return await this._executeWithRetry(makeRequest);
    } catch (error) {
      return this._handleError(error);
    }
  }

  public getModelName(): string {
    return this.modelName;
  }
}
