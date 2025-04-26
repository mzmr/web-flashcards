import type { CardSetDTO, TemporaryCard } from "@/types";

export const cardSetsApi = {
  async getCardSet(id: string): Promise<CardSetDTO> {
    const response = await fetch(`/api/card-sets/${id}`);
    if (!response.ok) {
      throw new Error("Nie udało się pobrać zestawu");
    }
    return response.json();
  },

  async saveCards(setId: string, cards: TemporaryCard[]): Promise<void> {
    const response = await fetch(`/api/card-sets/${setId}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cards: cards.map((temp) => ({
          front: temp.front,
          back: temp.back,
          source: temp.source,
          generation_id: temp.generation_id,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error("Wystąpił błąd podczas zapisywania fiszek");
    }
  },
};
