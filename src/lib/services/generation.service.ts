import type { SupabaseClient } from "../../db/supabase.client";
import type { GenerateFlashcardsCommand, GenerateFlashcardsResponseDTO, Generation } from "../../types";

export class GenerationServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly inputText?: string
  ) {
    super(message);
    this.name = "GenerationServiceError";
  }
}

/**
 * Service for handling flashcard generation
 */
export class GenerationService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  /**
   * Generates a mock set of flashcards based on input text
   * @throws {GenerationServiceError} When card set is not found or access is denied
   * @throws {GenerationServiceError} When generation cannot be saved to database
   */
  async generateFlashcards(command: GenerateFlashcardsCommand): Promise<GenerateFlashcardsResponseDTO> {
    const startTime = Date.now();

    try {
      // 1. Verify card set access
      await this.verifyCardSetAccess(command.card_set_id);

      // 2. Generate mock cards
      const mockCards = this.generateMockCards(command.input_text);

      // 3. Save generation to database
      const generation = await this.saveGeneration({
        card_set_id: command.card_set_id,
        input_text: command.input_text,
        duration: Date.now() - startTime,
        generated_count: mockCards.length,
      });

      return {
        generation_id: generation.id,
        cards: mockCards,
        created_at: generation.created_at,
        updated_at: generation.updated_at,
      };
    } catch (error) {
      await this.logGenerationError(error, command.input_text);
      throw error;
    }
  }

  /**
   * Verifies if user has access to the card set
   * @throws {GenerationServiceError} When card set is not found or access is denied
   */
  private async verifyCardSetAccess(cardSetId: string): Promise<void> {
    const { data: cardSet, error: cardSetError } = await this.supabase
      .from("card_sets")
      .select("id")
      .eq("id", cardSetId)
      .eq("user_id", this.userId)
      .single();

    if (cardSetError || !cardSet) {
      throw new GenerationServiceError("Card set not found or access denied", "CARD_SET_NOT_FOUND");
    }
  }

  /**
   * Generates mock flashcards from input text
   */
  private generateMockCards(inputText: string): { front: string; back: string }[] {
    const sentences = inputText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    return sentences.slice(0, 3).map((sentence) => {
      const words = sentence.split(" ");
      const keyPhrase = words.slice(0, 3).join(" ");
      return {
        front: `What comes after "${keyPhrase}..."?`,
        back: sentence,
      };
    });
  }

  /**
   * Saves generation data to database
   * @throws {GenerationServiceError} When generation cannot be saved
   */
  private async saveGeneration(params: {
    card_set_id: string;
    input_text: string;
    duration: number;
    generated_count: number;
  }): Promise<Generation> {
    const { data: generation, error: generationError } = await this.supabase
      .from("generations")
      .insert({
        card_set_id: params.card_set_id,
        input_text: params.input_text,
        user_id: this.userId,
        model: "mock-v1",
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
   * Logs generation error to the database
   */
  private async logGenerationError(error: unknown, inputText?: string): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorCode = error instanceof GenerationServiceError ? error.code : "UNKNOWN_ERROR";

    await this.supabase.from("generation_errors").insert({
      error_code: errorCode,
      error_message: errorMessage,
      input_text: inputText || null,
      model: "mock-v1",
      user_id: this.userId,
    });
  }
}
