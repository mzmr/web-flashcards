/**
 * @module GenerationService
 * @description Moduł odpowiedzialny za generowanie fiszek edukacyjnych przy użyciu API OpenRouter.
 * Zawiera logikę walidacji, przetwarzania odpowiedzi oraz obsługi błędów.
 */

import { z } from "zod";
import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDTO, Generation } from "../../types";
import { OpenRouterService } from "./openrouter.service";
import { OpenRouterError } from "./openrouter.types";

/**
 * Niestandardowa klasa błędu dla obsługi problemów związanych z generowaniem fiszek.
 * @class
 * @extends Error
 */
export class GenerationServiceError extends Error {
  /**
   * Tworzy nową instancję błędu generacji.
   * @param {string} message - Komunikat błędu
   * @param {string} code - Kod błędu (jeden z ERROR_CODES)
   * @param {string} [inputText] - Tekst wejściowy, który spowodował błąd
   * @param {Error} [cause] - Pierwotna przyczyna błędu (błąd, który został złapany)
   */
  constructor(
    message: string,
    public readonly code: string,
    public readonly inputText?: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "GenerationServiceError";
  }
}

/**
 * Stałe kody błędów używane w aplikacji.
 * @readonly
 * @enum {string}
 */
const ERROR_CODES = {
  /** Ogólny błąd generacji fiszek */
  GENERATION_FAILED: "GENERATION_FAILED",
  /** Błąd walidacji danych wejściowych lub wyjściowych */
  VALIDATION_FAILED: "VALIDATION_FAILED",
  /** Błąd zapisu generacji do bazy danych */
  SAVE_GENERATION_FAILED: "SAVE_GENERATION_FAILED",
  /** Błąd API OpenRouter */
  API_ERROR: "API_ERROR",
  /** Przekroczony limit zapytań do API */
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

/**
 * Schema Zod do walidacji odpowiedzi z API OpenRouter.
 * Definiuje oczekiwaną strukturę danych zwracanych przez API.
 * @private
 */
const flashcardsResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
        role: z.literal("assistant"),
      }),
      index: z.number(),
      finish_reason: z.string().optional(),
    })
  ),
  model: z.string(),
  created: z.number(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(),
});

/**
 * Typ reprezentujący zwalidowaną odpowiedź z API OpenRouter.
 */
type FlashcardsResponse = z.infer<typeof flashcardsResponseSchema>;

/**
 * Serwis odpowiedzialny za generowanie fiszek edukacyjnych.
 * Wykorzystuje API OpenRouter do tworzenia fiszek na podstawie tekstu wejściowego
 * oraz zapisuje wyniki generacji w bazie danych.
 * @class
 */
export class GenerationService {
  /**
   * Instancja serwisu OpenRouter do komunikacji z API.
   * @private
   */
  private openRouter: OpenRouterService;

  /**
   * Tworzy nową instancję serwisu generacji fiszek.
   * @param {SupabaseClient} supabase - Klient Supabase do komunikacji z bazą danych
   * @param {string} userId - Identyfikator użytkownika, dla którego generowane są fiszki
   */
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {
    this.openRouter = new OpenRouterService(flashcardsResponseSchema);
    this.openRouter.configure({
      systemMessage:
        "System: Jesteś asystentem specjalizującym się w tworzeniu fiszek edukacyjnych. " +
        "Twoje zadanie polega na generowaniu wysokiej jakości fiszek do nauki. " +
        "Każda fiszka powinna zawierać przód (pytanie lub pojęcie) i tył (odpowiedź lub definicję). " +
        "Treść powinna być zwięzła, precyzyjna i łatwa do zapamiętania. " +
        "Unikaj zbyt długich lub skomplikowanych wyjaśnień. " +
        "Zawsze dostosowuj poziom trudności do kontekstu i dziedziny.",
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "flashcards",
          schema: {
            type: "object",
            properties: {
              flashcards: {
                type: "array",
                items: {
                  type: "object",
                  required: ["front", "back"],
                  properties: {
                    front: { type: "string" },
                    back: { type: "string" },
                  },
                },
              },
            },
            required: ["flashcards"],
          },
        },
      },
    });
  }

  /**
   * Generuje fiszki na podstawie tekstu wejściowego przy użyciu API OpenRouter.
   * Zapisuje wyniki generacji w bazie danych i zwraca wygenerowane fiszki.
   *
   * @param {GenerateFlashcardsCommand} command - Obiekt zawierający tekst wejściowy do generacji fiszek
   * @returns {Promise<GenerateFlashcardsResponseDTO>} Obiekt zawierający wygenerowane fiszki i metadane
   * @throws {GenerationServiceError} Gdy generacja się nie powiedzie lub wystąpi błąd podczas zapisu do bazy danych
   *
   * @example
   * ```typescript
   * const result = await generationService.generateFlashcards({
   *   input_text: "Historia II wojny światowej"
   * });
   *
   * console.log(`Wygenerowano ${result.cards.length} fiszek`);
   * ```
   */
  async generateFlashcards(command: GenerateFlashcardsCommand): Promise<GenerateFlashcardsResponseDTO> {
    const startTime = Date.now();

    try {
      // 1. Generuj fiszki używając OpenRouter
      const response = (await this.openRouter.sendMessage(command.input_text)) as FlashcardsResponse;
      const cards = JSON.parse(response.choices[0].message.content).flashcards;

      // 2. Zapisz generację w bazie danych
      const generation = await this.saveGeneration({
        input_text: command.input_text,
        duration: Date.now() - startTime,
        generated_count: cards.length,
      });

      return {
        generation_id: generation.id,
        cards,
        created_at: generation.created_at,
        updated_at: generation.updated_at,
      };
    } catch (error) {
      let generationError: GenerationServiceError;

      if (error instanceof OpenRouterError) {
        if (error.message.includes("Rate limit exceeded")) {
          generationError = new GenerationServiceError(
            "Too many requests. Please try again later.",
            ERROR_CODES.RATE_LIMIT_EXCEEDED,
            command.input_text,
            error
          );
        } else {
          generationError = new GenerationServiceError(
            "Failed to generate flashcards",
            ERROR_CODES.API_ERROR,
            command.input_text,
            error
          );
        }
      } else if (error instanceof z.ZodError) {
        generationError = new GenerationServiceError(
          "Invalid response format",
          ERROR_CODES.VALIDATION_FAILED,
          command.input_text,
          error
        );
      } else {
        generationError = new GenerationServiceError(
          "Failed to generate flashcards",
          ERROR_CODES.GENERATION_FAILED,
          command.input_text,
          error instanceof Error ? error : undefined
        );
      }

      await this.logGenerationError(generationError, command.input_text);
      throw generationError;
    }
  }

  /**
   * Zapisuje dane generacji fiszek do bazy danych.
   *
   * @private
   * @param {Object} params - Parametry generacji do zapisania
   * @param {string} params.input_text - Tekst wejściowy użyty do generacji fiszek
   * @param {number} params.duration - Czas trwania generacji w milisekundach
   * @param {number} params.generated_count - Liczba wygenerowanych fiszek
   * @returns {Promise<Generation>} Zapisany rekord generacji z bazy danych
   * @throws {GenerationServiceError} Gdy zapis do bazy danych się nie powiedzie
   */
  private async saveGeneration(params: {
    input_text: string;
    duration: number;
    generated_count: number;
  }): Promise<Generation> {
    const { data: generation, error: generationError } = await this.supabase
      .from("generations")
      .insert({
        input_text: params.input_text,
        user_id: this.userId,
        model: this.openRouter.getModelName(),
        duration: params.duration,
        generated_count: params.generated_count,
        accepted_edited_count: null,
        accepted_unedited_count: null,
      })
      .select()
      .single();

    if (generationError || !generation) {
      throw new GenerationServiceError("Failed to save generation", "SAVE_GENERATION_FAILED");
    }

    return generation;
  }

  /**
   * Zapisuje błąd generacji fiszek do bazy danych.
   * Używana do celów diagnostycznych i monitorowania.
   *
   * @private
   * @param {GenerationServiceError} error - Błąd generacji do zalogowania
   * @param {string} [inputText] - Tekst wejściowy, który spowodował błąd
   * @returns {Promise<void>}
   */
  private async logGenerationError(error: GenerationServiceError, inputText?: string): Promise<void> {
    await this.supabase.from("generation_errors").insert({
      error_code: error.code,
      error_message: error.message,
      input_text: inputText || null,
      model: this.openRouter.getModelName(),
      user_id: this.userId,
      cause: error.cause
        ? {
            name: error.cause.name,
            message: error.cause.message,
          }
        : null,
    });
  }
}
