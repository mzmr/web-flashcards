import { z } from "zod";

// Konfiguracja retry
export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
}

// Klasy błędów
export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class OpenRouterAPIError extends OpenRouterError {
  constructor(
    public status: number,
    public statusText: string,
    public responseText: string
  ) {
    super(`API request failed with status ${status}: ${statusText}`);
    this.name = "OpenRouterAPIError";
  }
}

export class OpenRouterValidationError extends OpenRouterError {
  constructor(public zodError: z.ZodError) {
    super(`Invalid response format: ${zodError.message}`);
    this.name = "OpenRouterValidationError";
  }
}

// Parametry modelu
export interface ModelParams {
  temperature: number;
  max_tokens: number;
  top_p: number;
}

// Opcje konfiguracji
export interface ConfigOptions {
  modelName?: string;
  modelParams?: Partial<ModelParams>;
  systemMessage?: string;
  responseFormat?: {
    type: string;
    json_schema: Record<string, unknown>;
  };
  retryConfig?: Partial<RetryConfig>;
}

// Payload żądania
export interface RequestPayload {
  messages: {
    role: "system" | "user";
    content: string;
  }[];
  model: string;
  response_format?: {
    type: string;
    json_schema: Record<string, unknown>;
  };
}

// Generyczny schemat odpowiedzi - będzie nadpisywany przez konkretne implementacje
export const responseSchema = z.any();

export type Response = z.infer<typeof responseSchema>;
