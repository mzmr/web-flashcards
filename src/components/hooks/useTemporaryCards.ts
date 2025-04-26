import { useState, useCallback } from "react";
import type { TemporaryCard } from "@/types";
import { cardSetsApi } from "@/lib/api/cardSets";
import { useLocalStorage } from "./useLocalStorage";
import { toast } from "sonner";
import { redirectTo } from "@/lib/api/helpers";

export function useTemporaryCards(cardSetId: string) {
  const [temporaryCards, setTemporaryCards] = useState<TemporaryCard[]>([]);
  const [editingCard, setEditingCard] = useState<TemporaryCard | null>(null);
  const { addCard } = useLocalStorage();

  const addCards = useCallback((cards: Omit<TemporaryCard, "tempId">[]) => {
    const newCards = cards.map((card) => ({
      ...card,
      tempId: crypto.randomUUID(),
    }));
    setTemporaryCards((prev) => [...prev, ...newCards]);
  }, []);

  const editCard = useCallback((card: TemporaryCard) => {
    setEditingCard(card);
  }, []);

  const deleteCard = useCallback((tempId: string) => {
    setTemporaryCards((prev) => prev.filter((card) => card.tempId !== tempId));
  }, []);

  const addManualCard = useCallback(() => {
    setEditingCard({
      tempId: "",
      front: "",
      back: "",
      source: "user_created",
    });
  }, []);

  const saveCard = useCallback(
    (data: TemporaryCard) => {
      if (editingCard) {
        if (editingCard.tempId) {
          // Edycja istniejącej fiszki
          setTemporaryCards((prev) =>
            prev.map((card) =>
              card.tempId === editingCard.tempId
                ? {
                    ...card,
                    ...data,
                    source: card.source === "ai_generated" ? "ai_edited" : card.source,
                  }
                : card
            )
          );
        } else {
          // Dodawanie nowej fiszki
          setTemporaryCards((prev) => [
            ...prev,
            {
              ...editingCard,
              ...data,
              tempId: crypto.randomUUID(),
            },
          ]);
        }
        setEditingCard(null);
      }
    },
    [editingCard]
  );

  const submitAll = useCallback(
    async (isLocal: boolean) => {
      try {
        if (!isLocal) {
          await cardSetsApi.saveCards(cardSetId, temporaryCards);
        } else {
          temporaryCards.forEach((card) => {
            addCard(cardSetId, card.front, card.back);
          });
        }
        redirectTo(`/card-sets/${cardSetId}`);
      } catch {
        toast.error("Nie udało się zapisać fiszek", {
          description: "Spróbuj ponownie później",
        });
      }
    },
    [cardSetId, temporaryCards, addCard]
  );

  return {
    temporaryCards,
    editingCard,
    addCards,
    editCard,
    deleteCard,
    addManualCard,
    saveCard,
    submitAll,
    setEditingCard,
  };
}
