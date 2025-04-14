import type { SupabaseClient } from "../../db/supabase.client";
import type { CardSetDTO, CreateCardSetCommand, CardSet, UUID, CardSetDetailDTO, Card } from "../../types";

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
}
