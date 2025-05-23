/**
 * @fileoverview Moduł obsługujący operacje na zestawach fiszek (CardSets) w bazie danych Supabase.
 * @module CardSetService
 */

import type { SupabaseClient } from "../../db/supabase.client";
import type { CardSetDTO, CreateCardSetCommand, CardSet, UUID, CardSetDetailDTO, Card } from "../../types";

/**
 * Klasa reprezentująca błędy związane z operacjami na zestawach fiszek.
 * @extends Error
 */
export class CardSetServiceError extends Error {
  /**
   * Tworzy nową instancję błędu CardSetServiceError.
   * @param {string} message - Komunikat błędu
   * @param {string} code - Kod błędu używany do identyfikacji typu błędu
   */
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "CardSetServiceError";
  }
}

/**
 * Serwis odpowiedzialny za zarządzanie zestawami fiszek w systemie.
 * Obsługuje operacje CRUD na zestawach fiszek oraz powiązanych z nimi kartach.
 */
export class CardSetService {
  /**
   * Tworzy nową instancję serwisu CardSetService.
   * @param {SupabaseClient} supabase - Klient bazy danych Supabase
   */
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Tworzy nowy zestaw fiszek dla określonego użytkownika.
   * @param {UUID} userId - Identyfikator użytkownika tworzącego zestaw
   * @param {CreateCardSetCommand} command - Dane nowego zestawu
   * @returns {Promise<CardSetDTO>} Utworzony zestaw fiszek
   * @throws {CardSetServiceError} Gdy wystąpi błąd podczas tworzenia zestawu
   */
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

  /**
   * Pobiera listę zestawów fiszek dla określonego użytkownika z obsługą paginacji i sortowania.
   * @param {UUID} userId - Identyfikator użytkownika
   * @param {number} page - Numer strony (rozpoczynając od 1)
   * @param {number} limit - Liczba elementów na stronie
   * @param {"created_at" | "updated_at" | "name"} [sort] - Opcjonalne pole sortowania
   * @returns {Promise<{cardSets: CardSetDTO[], total: number}>} Lista zestawów i całkowita liczba dostępnych zestawów
   * @throws {CardSetServiceError} Gdy wystąpi błąd podczas pobierania zestawów
   */
  async listCardSets(
    userId: UUID,
    page: number,
    limit: number,
    sort?: "created_at" | "updated_at" | "name"
  ): Promise<{ cardSets: CardSetDTO[]; total: number }> {
    // Przygotowanie zapytania bazowego
    let query = this.supabase.from("card_sets").select("*", { count: "exact" }).eq("user_id", userId);

    // Dodanie sortowania
    if (sort) {
      query = query.order(sort, { ascending: sort === "name" });
    } else {
      query = query.order("updated_at", { ascending: false });
    }

    // Dodanie paginacji
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Wykonanie zapytania
    const { data, error, count } = await query;

    if (error) {
      throw new CardSetServiceError(
        `Błąd podczas pobierania zestawów fiszek: ${error.message}`,
        "LIST_CARD_SETS_FAILED"
      );
    }

    if (!data || count === null) {
      throw new CardSetServiceError("Nie udało się pobrać zestawów fiszek", "LIST_CARD_SETS_FAILED");
    }

    // Mapowanie wyników do DTO
    const cardSets: CardSetDTO[] = data.map((cardSet: CardSet) => ({
      id: cardSet.id,
      name: cardSet.name,
      created_at: cardSet.created_at,
      updated_at: cardSet.updated_at,
    }));

    return {
      cardSets,
      total: count,
    };
  }

  /**
   * Pobiera szczegółowe informacje o zestawie fiszek wraz z powiązanymi kartami.
   * @param {UUID} cardSetId - Identyfikator zestawu fiszek
   * @returns {Promise<CardSetDetailDTO | null>} Szczegóły zestawu lub null jeśli nie znaleziono
   * @throws {CardSetServiceError} Gdy wystąpi błąd podczas pobierania danych
   */
  async getCardSetDetails(cardSetId: UUID): Promise<CardSetDetailDTO | null> {
    // Pobranie podstawowych informacji o zestawie
    const { data: cardSet, error: cardSetError } = await this.supabase
      .from("card_sets")
      .select("*")
      .eq("id", cardSetId)
      .single();

    if (cardSetError) {
      throw new CardSetServiceError(`Błąd podczas pobierania zestawu: ${cardSetError.message}`, "GET_CARD_SET_FAILED");
    }

    if (!cardSet) {
      return null;
    }

    // Pobranie powiązanych fiszek
    const { data: cards, error: cardsError } = await this.supabase
      .from("cards")
      .select("*")
      .eq("card_set_id", cardSetId);

    if (cardsError) {
      throw new CardSetServiceError(`Błąd podczas pobierania fiszek: ${cardsError.message}`, "GET_CARDS_FAILED");
    }

    const typedCardSet = cardSet as CardSet;
    const typedCards = (cards || []) as Card[];

    // Mapowanie na DTO
    return {
      id: typedCardSet.id,
      name: typedCardSet.name,
      created_at: typedCardSet.created_at,
      updated_at: typedCardSet.updated_at,
      cards: typedCards.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        source: card.source,
        generation_id: card.generation_id,
        created_at: card.created_at,
        updated_at: card.updated_at,
      })),
    };
  }

  /**
   * Aktualizuje nazwę zestawu fiszek.
   * @param {UUID} userId - Identyfikator właściciela zestawu
   * @param {UUID} cardSetId - Identyfikator zestawu do aktualizacji
   * @param {string} name - Nowa nazwa zestawu
   * @returns {Promise<CardSetDTO>} Zaktualizowany zestaw fiszek
   * @throws {CardSetServiceError} Gdy wystąpi błąd podczas aktualizacji lub brak uprawnień
   */
  async updateCardSet(userId: UUID, cardSetId: UUID, name: string): Promise<CardSetDTO> {
    // Sprawdzenie czy zestaw istnieje i należy do użytkownika
    const { data: existingSet, error: checkError } = await this.supabase
      .from("card_sets")
      .select("*")
      .eq("id", cardSetId)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      throw new CardSetServiceError(
        `Błąd podczas sprawdzania zestawu: ${checkError.message}`,
        "UPDATE_CARD_SET_FAILED"
      );
    }

    if (!existingSet) {
      throw new CardSetServiceError("Nie znaleziono zestawu fiszek lub brak uprawnień", "CARD_SET_NOT_FOUND");
    }

    // Aktualizacja zestawu
    const { data: updatedSet, error: updateError } = await this.supabase
      .from("card_sets")
      .update({ name })
      .eq("id", cardSetId)
      .select()
      .single();

    if (updateError) {
      throw new CardSetServiceError(
        `Błąd podczas aktualizacji zestawu: ${updateError.message}`,
        "UPDATE_CARD_SET_FAILED"
      );
    }

    if (!updatedSet) {
      throw new CardSetServiceError("Nie udało się zaktualizować zestawu fiszek", "UPDATE_CARD_SET_FAILED");
    }

    const cardSet: CardSet = updatedSet;

    return {
      id: cardSet.id,
      name: cardSet.name,
      created_at: cardSet.created_at,
      updated_at: cardSet.updated_at,
    };
  }

  /**
   * Usuwa zestaw fiszek wraz ze wszystkimi powiązanymi kartami.
   * @param {UUID} userId - Identyfikator właściciela zestawu
   * @param {UUID} cardSetId - Identyfikator zestawu do usunięcia
   * @returns {Promise<void>}
   * @throws {CardSetServiceError} Gdy wystąpi błąd podczas usuwania lub brak uprawnień
   * @remarks Usunięcie jest kaskadowe - wszystkie powiązane karty zostaną również usunięte
   */
  async deleteCardSet(userId: UUID, cardSetId: UUID): Promise<void> {
    // Sprawdzenie czy zestaw istnieje i należy do użytkownika
    const { data: existingSet, error: checkError } = await this.supabase
      .from("card_sets")
      .select("*")
      .eq("id", cardSetId)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      throw new CardSetServiceError(
        `Błąd podczas sprawdzania zestawu: ${checkError.message}`,
        "DELETE_CARD_SET_FAILED"
      );
    }

    if (!existingSet) {
      throw new CardSetServiceError("Nie znaleziono zestawu fiszek lub brak uprawnień", "CARD_SET_NOT_FOUND");
    }

    // Usunięcie zestawu (kaskadowe usunięcie fiszek jest obsługiwane przez bazę danych)
    const { error: deleteError } = await this.supabase.from("card_sets").delete().eq("id", cardSetId);

    if (deleteError) {
      throw new CardSetServiceError(`Błąd podczas usuwania zestawu: ${deleteError.message}`, "DELETE_CARD_SET_FAILED");
    }
  }
}
