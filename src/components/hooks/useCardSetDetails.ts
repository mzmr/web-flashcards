import { useState, useEffect, useMemo } from "react";
import type { UUID, UpdateCardCommand, CardSetDetailDTO } from "@/types";
import { useLocalStorage } from "./useLocalStorage";
import { toast } from "sonner";
import { redirectTo } from "@/lib/api/helpers";

export function useCardSetDetails(id: UUID) {
  const [cardSet, setCardSet] = useState<CardSetDetailDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { getCardSet, updateCardSet, deleteCardSet, updateCard, deleteCard } = useLocalStorage();

  useEffect(() => {
    async function fetchCardSet() {
      try {
        setIsLoading(true);
        const localSet = getCardSet(id);

        if (localSet) {
          setCardSet({ ...localSet, cards: localSet.cards || [] });
          return;
        }

        const response = await fetch(`/api/card-sets/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch card set");
        }
        const data = await response.json();
        setCardSet({ ...data, cards: data.cards || [] });
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
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

  const handleUpdateCard = async (cardId: UUID, data: UpdateCardCommand) => {
    if (!cardSet) return;

    try {
      if (cardSet.isLocal) {
        updateCard(cardSet.id, cardId, data);
        setCardSet((prev) =>
          prev
            ? {
                ...prev,
                cards: prev.cards.map((card) =>
                  card.id === cardId ? { ...card, ...data, updated_at: new Date().toISOString() } : card
                ),
              }
            : null
        );
        toast.success("Fiszka została zaktualizowana");
      } else {
        const response = await fetch(`/api/card-sets/${cardSet.id}/cards/${cardId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error();

        const updatedCard = await response.json();
        setCardSet((prev) =>
          prev
            ? {
                ...prev,
                cards: prev.cards.map((card) => (card.id === cardId ? updatedCard : card)),
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

  const handleSaveToCloud = async () => {
    if (!cardSet?.isLocal) return;

    try {
      setIsSaving(true);
      // Najpierw tworzymy nowy zestaw
      const createResponse = await fetch("/api/card-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cardSet.name }),
      });

      if (!createResponse.ok) throw new Error("Nie udało się utworzyć zestawu");

      const newSet = await createResponse.json();

      // Następnie dodajemy wszystkie karty
      if (cardSet.cards.length > 0) {
        const addCardsResponse = await fetch(`/api/card-sets/${newSet.id}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cards: cardSet.cards.map(({ front, back, source, generation_id }) => ({
              front,
              back,
              source,
              ...(generation_id !== null ? { generation_id } : {}),
            })),
          }),
        });

        if (!addCardsResponse.ok) {
          const errorData = await addCardsResponse.json();
          throw new Error(errorData.error || "Nie udało się dodać kart");
        }
      }

      // Usuwamy lokalny zestaw
      deleteCardSet(cardSet.id);
      toast.success("Zestaw został zapisany w chmurze");

      // Przekierowujemy do nowego zestawu
      redirectTo(`/card-sets/${newSet.id}`);
    } catch (error) {
      toast.error("Nie udało się zapisać zestawu w chmurze");
      console.error("Błąd podczas zapisywania zestawu:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCards = useMemo(() => {
    if (!cardSet?.cards) return [];
    if (!searchTerm.trim()) return cardSet.cards;

    const term = searchTerm.toLowerCase().trim();
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
    isSaving,
    setSearchTerm,
    updateCardSetName: handleUpdateCardSetName,
    deleteCardSet: handleDeleteCardSet,
    updateCard: handleUpdateCard,
    deleteCard: handleDeleteCard,
    saveToCloud: handleSaveToCloud,
  };
}
