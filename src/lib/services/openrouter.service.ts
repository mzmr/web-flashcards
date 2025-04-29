/**
 * @fileoverview Moduł obsługujący integrację z API OpenRouter dla generowania odpowiedzi AI.
 * @module OpenRouterService
 */

import { z } from "zod";
import { OpenRouterError, OpenRouterAPIError, OpenRouterValidationError } from "./openrouter.types";
import type { ModelParams, ConfigOptions, RequestPayload, Response, RetryConfig } from "./openrouter.types";
import { OPENROUTER_API_KEY, OPENROUTER_API_URL } from "astro:env/server";

/**
 * Klasa obsługująca komunikację z API OpenRouter.
 * Zapewnia interfejs do wysyłania wiadomości i otrzymywania odpowiedzi od modeli AI.
 *
 * @class OpenRouterService
 * @throws {OpenRouterError} Gdy brak wymaganego klucza API w zmiennych środowiskowych
 */
export class OpenRouterService {
  /** @public URL endpointu API OpenRouter */
  public readonly apiUrl: string;

  /** @public Klucz API do autoryzacji żądań */
  public readonly apiKey: string;

  /** @public Nazwa modelu AI do wykorzystania */
  public modelName: string;

  /** @public Parametry konfiguracyjne modelu */
  public modelParams: ModelParams;

  /** @public Wiadomość systemowa dodawana do każdego żądania */
  public systemMessage: string;

  /** @public Opcjonalny format odpowiedzi */
  public responseFormat?: ConfigOptions["responseFormat"];

  /** @private Schema walidacji odpowiedzi */
  private _responseSchema: z.ZodType;

  /** @private Konfiguracja mechanizmu ponawiania żądań */
  private _retryConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffFactor: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  };

  /**
   * Tworzy nową instancję serwisu OpenRouter.
   *
   * @constructor
   * @param {z.ZodType} responseSchema - Schema Zod do walidacji odpowiedzi API
   * @throws {OpenRouterError} Gdy brak wymaganego klucza API
   */
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

  /**
   * Waliduje odpowiedź otrzymaną z API.
   *
   * @private
   * @param {unknown} data - Dane do walidacji
   * @returns {Promise<Response>} Zwalidowana odpowiedź
   * @throws {OpenRouterValidationError} Gdy dane nie przejdą walidacji
   * @throws {OpenRouterError} Gdy dane są puste lub nieprawidłowego typu
   */
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

  /**
   * Obsługuje błędy powstałe podczas komunikacji z API.
   *
   * @private
   * @param {unknown} error - Błąd do obsłużenia
   * @throws {OpenRouterError} Przetworzona informacja o błędzie
   */
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

  /**
   * Przygotowuje payload żądania do API.
   *
   * @private
   * @param {string} userMessage - Wiadomość od użytkownika
   * @returns {RequestPayload} Przygotowany payload żądania
   */
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

  /**
   * Wykonuje operację z mechanizmem automatycznego ponawiania.
   *
   * @private
   * @template T
   * @param {() => Promise<T>} operation - Operacja do wykonania
   * @param {number} [attempt=1] - Numer próby
   * @returns {Promise<T>} Wynik operacji
   * @throws {OpenRouterAPIError} Gdy wszystkie próby się nie powiodą
   */
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

  /**
   * Konfiguruje instancję serwisu.
   *
   * @public
   * @param {ConfigOptions} options - Opcje konfiguracyjne
   * @param {string} [options.modelName] - Nazwa modelu AI
   * @param {ModelParams} [options.modelParams] - Parametry modelu
   * @param {string} [options.systemMessage] - Wiadomość systemowa
   * @param {object} [options.responseFormat] - Format odpowiedzi
   * @param {RetryConfig} [options.retryConfig] - Konfiguracja ponawiania
   */
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

  /**
   * Wysyła wiadomość do API i zwraca odpowiedź.
   *
   * @public
   * @param {string} userMessage - Wiadomość do wysłania
   * @returns {Promise<Response>} Odpowiedź z API
   * @throws {OpenRouterError} Gdy wystąpi błąd podczas komunikacji
   * @throws {OpenRouterValidationError} Gdy odpowiedź nie przejdzie walidacji
   * @throws {OpenRouterAPIError} Gdy API zwróci błąd
   */
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

  /**
   * Zwraca aktualną nazwę używanego modelu.
   *
   * @public
   * @returns {string} Nazwa modelu
   */
  public getModelName(): string {
    return this.modelName;
  }
}
