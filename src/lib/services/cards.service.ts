import type { SupabaseClient } from "@/db/supabase.client";
import type {
  UpdateCardCommand,
  UpdateCardResponseDTO,
  CardDTO,
  DeleteCardResponseDTO,
  CardCreateInput,
} from "@/types";

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
        source: existingCard.source === "ai_generated" ? "ai_edited" : existingCard.source,
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

  /**
   * Dodaje nowe fiszki do zestawu
   * @param cardSetId - ID zestawu fiszek
   * @param cards - Lista fiszek do dodania
   * @param userId - ID użytkownika wykonującego operację
   * @returns Lista utworzonych fiszek
   * @throws {CardsServiceError} Gdy zestaw fiszek nie istnieje lub brak dostępu
   * @throws {CardsServiceError} Gdy nie udało się utworzyć fiszek
   */
  async createCards(cardSetId: string, cards: CardCreateInput[], userId: string): Promise<CardDTO[]> {
    // 1. Sprawdź czy zestaw fiszek istnieje i należy do użytkownika
    const { data: cardSet, error: cardSetError } = await this.supabase
      .from("card_sets")
      .select("id")
      .eq("id", cardSetId)
      .eq("user_id", userId)
      .single();

    if (cardSetError || !cardSet) {
      throw new CardsServiceError("Zestaw fiszek nie istnieje lub brak dostępu", "CARD_SET_NOT_FOUND");
    }

    // 2. Przygotuj dane do insertu
    const cardsToInsert = cards.map((card) => ({
      ...card,
      card_set_id: cardSetId,
      generation_id: card.source === "user_created" ? null : card.generation_id,
    }));

    // 3. Dodaj fiszki do bazy danych
    const { data: createdCards, error: insertError } = await this.supabase
      .from("cards")
      .insert(cardsToInsert)
      .select("*");

    if (insertError) {
      throw new CardsServiceError("Nie udało się utworzyć fiszek", "CREATE_CARDS_FAILED");
    }

    if (!createdCards) {
      throw new CardsServiceError("Nie utworzono żadnych fiszek", "NO_CARDS_CREATED");
    }

    // 4. Zwróć utworzone fiszki
    return createdCards.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      source: card.source,
      generation_id: card.generation_id,
      created_at: card.created_at,
      updated_at: card.updated_at,
    }));
  }
}
