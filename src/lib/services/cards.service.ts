import type { SupabaseClient } from "@/db/supabase.client";
import type { UpdateCardCommand, UpdateCardResponseDTO, CardDTO, DeleteCardResponseDTO } from "@/types";

export class CardsServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "CardsServiceError";
  }
}

export class CardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Aktualizuje istniejącą kartę w zestawie
   * @param cardSetId - ID zestawu kart
   * @param cardId - ID karty do aktualizacji
   * @param data - Dane do aktualizacji
   * @param userId - ID użytkownika wykonującego operację
   * @throws {CardsServiceError} Gdy zestaw kart nie istnieje lub brak dostępu
   * @throws {CardsServiceError} Gdy karta nie istnieje w zestawie
   * @throws {CardsServiceError} Gdy nie udało się zaktualizować karty
   */
  async updateCard(
    cardSetId: string,
    cardId: string,
    data: UpdateCardCommand,
    userId: string
  ): Promise<UpdateCardResponseDTO> {
    // 1. Sprawdź czy zestaw kart istnieje i należy do użytkownika
    const { data: cardSet, error: cardSetError } = await this.supabase
      .from("card_sets")
      .select("id")
      .eq("id", cardSetId)
      .eq("user_id", userId)
      .single();

    if (cardSetError || !cardSet) {
      throw new CardsServiceError("Zestaw kart nie istnieje lub brak dostępu", "CARD_SET_NOT_FOUND");
    }

    // 2. Sprawdź czy karta istnieje w zestawie
    const { data: existingCard, error: cardError } = await this.supabase
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .eq("card_set_id", cardSetId)
      .single();

    if (cardError || !existingCard) {
      throw new CardsServiceError("Karta nie istnieje w tym zestawie", "CARD_NOT_FOUND");
    }

    // 3. Aktualizuj kartę
    const { data: updatedCard, error: updateError } = await this.supabase
      .from("cards")
      .update({
        front: data.front,
        back: data.back,
      })
      .eq("id", cardId)
      .eq("card_set_id", cardSetId)
      .select()
      .single();

    if (updateError || !updatedCard) {
      throw new CardsServiceError("Nie udało się zaktualizować karty", "UPDATE_CARD_FAILED");
    }

    return updatedCard as CardDTO;
  }

  /**
   * Usuwa kartę z zestawu
   * @param cardSetId - ID zestawu kart
   * @param cardId - ID karty do usunięcia
   * @param userId - ID użytkownika wykonującego operację
   * @throws {CardsServiceError} Gdy zestaw kart nie istnieje lub brak dostępu
   * @throws {CardsServiceError} Gdy karta nie istnieje w zestawie
   * @throws {CardsServiceError} Gdy nie udało się usunąć karty
   */
  async deleteCard(cardSetId: string, cardId: string, userId: string): Promise<DeleteCardResponseDTO> {
    // 1. Sprawdź czy zestaw kart istnieje i należy do użytkownika
    const { data: cardSet, error: cardSetError } = await this.supabase
      .from("card_sets")
      .select("id")
      .eq("id", cardSetId)
      .eq("user_id", userId)
      .single();

    if (cardSetError || !cardSet) {
      throw new CardsServiceError("Zestaw fiszek nie istnieje lub brak dostępu", "CARD_SET_NOT_FOUND");
    }

    // 2. Sprawdź czy karta istnieje w zestawie
    const { data: card, error: cardError } = await this.supabase
      .from("cards")
      .select("id")
      .eq("id", cardId)
      .eq("card_set_id", cardSetId)
      .single();

    if (cardError || !card) {
      throw new CardsServiceError("Fiszka nie istnieje w tym zestawie", "CARD_NOT_FOUND");
    }

    // 3. Usuń kartę
    const { error: deleteError } = await this.supabase
      .from("cards")
      .delete()
      .eq("id", cardId)
      .eq("card_set_id", cardSetId);

    if (deleteError) {
      throw new CardsServiceError("Wystąpił błąd podczas usuwania fiszki", "DELETE_CARD_FAILED");
    }

    return {
      message: "Fiszka została pomyślnie usunięta",
    };
  }
}
