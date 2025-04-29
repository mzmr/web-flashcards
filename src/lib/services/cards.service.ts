/**
 * @fileoverview Moduł obsługujący operacje na fiszkach (Cards) w bazie danych Supabase.
 * Zapewnia funkcjonalność CRUD dla pojedynczych fiszek w zestawach.
 * @module CardsService
 * @requires @supabase/supabase-js
 */

import type { SupabaseClient } from "@/db/supabase.client";
import type {
  UpdateCardCommand,
  UpdateCardResponseDTO,
  CardDTO,
  DeleteCardResponseDTO,
  CardCreateInput,
} from "@/types";

/**
 * Klasa reprezentująca błędy specyficzne dla operacji na fiszkach.
 * @extends Error
 */
export class CardsServiceError extends Error {
  /**
   * Tworzy nową instancję błędu CardsServiceError.
   * @param {string} message - Szczegółowy opis błędu
   * @param {string} code - Unikalny kod błędu używany do identyfikacji typu problemu
   */
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "CardsServiceError";
  }
}

/**
 * Serwis odpowiedzialny za zarządzanie pojedynczymi fiszkami w systemie.
 * Obsługuje operacje CRUD na fiszkach w kontekście zestawów fiszek.
 */
export class CardsService {
  /**
   * Tworzy nową instancję serwisu CardsService.
   * @param {SupabaseClient} supabase - Klient bazy danych Supabase używany do wykonywania operacji
   */
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Aktualizuje istniejącą fiszkę w zestawie.
   *
   * @param {string} cardSetId - Identyfikator zestawu fiszek
   * @param {string} cardId - Identyfikator fiszki do aktualizacji
   * @param {UpdateCardCommand} data - Dane do aktualizacji zawierające front i back
   * @param {string} userId - Identyfikator użytkownika wykonującego operację
   * @returns {Promise<UpdateCardResponseDTO>} Zaktualizowana fiszka
   * @throws {CardsServiceError} CARD_SET_NOT_FOUND - Gdy zestaw fiszek nie istnieje lub użytkownik nie ma do niego dostępu
   * @throws {CardsServiceError} CARD_NOT_FOUND - Gdy fiszka nie istnieje w danym zestawie
   * @throws {CardsServiceError} UPDATE_CARD_FAILED - Gdy operacja aktualizacji nie powiodła się
   *
   * @remarks
   * Metoda automatycznie aktualizuje pole source na 'ai_edited' jeśli fiszka była wcześniej wygenerowana przez AI.
   * Zachowuje oryginalne źródło dla fiszek utworzonych przez użytkownika.
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
   * Usuwa fiszkę z zestawu.
   *
   * @param {string} cardSetId - Identyfikator zestawu fiszek
   * @param {string} cardId - Identyfikator fiszki do usunięcia
   * @param {string} userId - Identyfikator użytkownika wykonującego operację
   * @returns {Promise<DeleteCardResponseDTO>} Obiekt potwierdzający usunięcie fiszki
   * @throws {CardsServiceError} CARD_SET_NOT_FOUND - Gdy zestaw fiszek nie istnieje lub użytkownik nie ma do niego dostępu
   * @throws {CardsServiceError} CARD_NOT_FOUND - Gdy fiszka nie istnieje w danym zestawie
   * @throws {CardsServiceError} DELETE_CARD_FAILED - Gdy operacja usunięcia nie powiodła się
   *
   * @remarks
   * Operacja jest nieodwracalna - usuniętej fiszki nie można przywrócić.
   * Przed usunięciem wykonywana jest weryfikacja uprawnień użytkownika do zestawu.
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
   * Dodaje nowe fiszki do istniejącego zestawu.
   *
   * @param {string} cardSetId - Identyfikator zestawu fiszek
   * @param {CardCreateInput[]} cards - Lista fiszek do dodania
   * @param {string} userId - Identyfikator użytkownika wykonującego operację
   * @returns {Promise<CardDTO[]>} Lista utworzonych fiszek
   * @throws {CardsServiceError} CARD_SET_NOT_FOUND - Gdy zestaw fiszek nie istnieje lub użytkownik nie ma do niego dostępu
   * @throws {CardsServiceError} CREATE_CARDS_FAILED - Gdy nie udało się utworzyć fiszek
   * @throws {CardsServiceError} NO_CARDS_CREATED - Gdy żadna fiszka nie została utworzona
   *
   * @remarks
   * - Metoda obsługuje tworzenie wielu fiszek w jednej operacji
   * - Dla fiszek utworzonych przez użytkownika (source: 'user_created') pole generation_id jest automatycznie ustawiane na null
   * - Wszystkie fiszki są dodawane w ramach jednej transakcji - jeśli którakolwiek się nie powiedzie, żadna nie zostanie utworzona
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
