import type { SupabaseClient } from "../../db/supabase.client";
import type { CardSetDTO, CreateCardSetCommand, CardSet, UUID } from "../../types";

export class CardSetServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "CardSetServiceError";
  }
}

export class CardSetService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createCardSet(userId: UUID, command: CreateCardSetCommand): Promise<CardSetDTO> {
    const { data, error } = await this.supabase
      .from("card_sets")
      .insert({
        name: command.name,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new CardSetServiceError(
        `Błąd podczas tworzenia zestawu fiszek: ${error.message}`,
        "CREATE_CARD_SET_FAILED"
      );
    }

    if (!data) {
      throw new CardSetServiceError("Nie udało się utworzyć zestawu fiszek", "CREATE_CARD_SET_FAILED");
    }

    const cardSet: CardSet = data;

    return {
      id: cardSet.id,
      name: cardSet.name,
      created_at: cardSet.created_at,
      updated_at: cardSet.updated_at,
    };
  }
}
