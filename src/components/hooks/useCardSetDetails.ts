import { useState, useEffect, useMemo } from "react";
import type { CardSetDTO, UUID } from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import { toast } from "sonner";
import { redirectTo } from "@/lib/api/helpers";

export function useCardSetDetails(id: UUID) {
  const [cardSet, setCardSet] = useState<CardSetDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { getCardSet, updateCardSet, deleteCardSet, updateCard, deleteCard } = useLocalStorage();

  useEffect(() => {
    async function fetchCardSet() {
      try {
        setIsLoading(true);
        const localSet = getCardSet(id);

        if (localSet) {
          setCardSet(localSet);
          return;
        }

        const response = await fetch(`/api/card-sets/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch card set");
        }
        const data = await response.json();
        setCardSet(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error);
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchCardSet();
  }, [id, getCardSet]);

  const handleUpdateCardSetName = async (name: string) => {
    if (!cardSet) return;

    try {
      if (cardSet.isLocal) {
        updateCardSet(cardSet.id, name);
        setCardSet((prev) => (prev ? { ...prev, name } : null));
        toast.success("Nazwa zestawu została zaktualizowana");
      } else {
        const response = await fetch(`/api/card-sets/${cardSet.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!response.ok) throw new Error();

        const updatedSet = await response.json();
        setCardSet(updatedSet);
        toast.success("Nazwa zestawu została zaktualizowana");
      }
    } catch {
      toast.error("Nie udało się zaktualizować nazwy zestawu");
    }
  };

  const handleDeleteCardSet = async () => {
    if (!cardSet) return;

    try {
      if (cardSet.isLocal) {
        deleteCardSet(cardSet.id);
        toast.success("Zestaw został usunięty");
        redirectTo("/card-sets");
      } else {
        const response = await fetch(`/api/card-sets/${cardSet.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error();

        toast.success("Zestaw został usunięty");
        redirectTo("/card-sets");
      }
    } catch {
      toast.error("Nie udało się usunąć zestawu");
    }
  };

  const handleUpdateCard = async (cardId: UUID, front: string, back: string) => {
    if (!cardSet) return;

    try {
      if (cardSet.isLocal) {
        updateCard(cardSet.id, cardId, front, back);
        setCardSet((prev) =>
          prev
            ? {
                ...prev,
                cards: (prev.cards || []).map((card) =>
                  card.id === cardId ? { ...card, front, back, updated_at: new Date().toISOString() } : card
                ),
              }
            : null
        );
        toast.success("Fiszka została zaktualizowana");
      } else {
        const response = await fetch(`/api/card-sets/${cardSet.id}/cards/${cardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front, back }),
        });

        if (!response.ok) throw new Error();

        const updatedCard = await response.json();
        setCardSet((prev) =>
          prev
            ? {
                ...prev,
                cards: (prev.cards || []).map((card) => (card.id === cardId ? updatedCard : card)),
              }
            : null
        );
        toast.success("Fiszka została zaktualizowana");
      }
    } catch {
      toast.error("Nie udało się zaktualizować fiszki");
    }
  };

  const handleDeleteCard = async (cardId: UUID) => {
    if (!cardSet) return;

    try {
      if (cardSet.isLocal) {
        deleteCard(cardSet.id, cardId);
        setCardSet((prev) =>
          prev
            ? {
                ...prev,
                cards: (prev.cards || []).filter((card) => card.id !== cardId),
              }
            : null
        );
        toast.success("Fiszka została usunięta");
      } else {
        const response = await fetch(`/api/card-sets/${cardSet.id}/cards/${cardId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error();

        setCardSet((prev) =>
          prev
            ? {
                ...prev,
                cards: (prev.cards || []).filter((card) => card.id !== cardId),
              }
            : null
        );
        toast.success("Fiszka została usunięta");
      }
    } catch {
      toast.error("Nie udało się usunąć fiszki");
    }
  };

  const filteredCards = useMemo(() => {
    if (!cardSet?.cards) return [];
    if (!searchTerm.trim()) return cardSet.cards;

    const term = searchTerm.toLowerCase();
    return cardSet.cards.filter(
      (card) => card.front.toLowerCase().includes(term) || card.back.toLowerCase().includes(term)
    );
  }, [cardSet?.cards, searchTerm]);

  return {
    isLoading,
    error,
    cardSet,
    filteredCards,
    searchTerm,
    setSearchTerm,
    updateCardSetName: handleUpdateCardSetName,
    deleteCardSet: handleDeleteCardSet,
    updateCard: handleUpdateCard,
    deleteCard: handleDeleteCard,
  };
}
