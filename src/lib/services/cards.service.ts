import type { SupabaseClient } from "@/db/supabase.client";
import type { UpdateCardCommand, UpdateCardResponseDTO, CardDTO } from "@/types";

export class CardsService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Aktualizuje istniejącą kartę w zestawie
   * @param cardSetId - ID zestawu kart
   * @param cardId - ID karty do aktualizacji
   * @param data - Dane do aktualizacji
   * @param userId - ID użytkownika wykonującego operację
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
      throw new Error("Zestaw kart nie istnieje lub brak dostępu");
    }

    // 2. Sprawdź czy karta istnieje w zestawie
    const { data: existingCard, error: cardError } = await this.supabase
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .eq("card_set_id", cardSetId)
      .single();

    if (cardError || !existingCard) {
      throw new Error("Karta nie istnieje w tym zestawie");
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
      throw new Error("Nie udało się zaktualizować karty");
    }

    return updatedCard as CardDTO;
  }
}
