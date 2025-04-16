import { useState, useEffect, useCallback } from "react";
import type { UUID, CardSetDetailDTO, CardDTO, UpdateCardCommand } from "@/types";
import type { ApiError } from "@/lib/api/types";
import { handleApiResponse, redirectTo } from "@/lib/api/helpers";

interface CardSetDetailsState {
  isLoading: boolean;
  error: string | null;
  cardSet: CardSetDetailDTO | null;
  filteredCards: CardDTO[] | null;
  searchTerm: string;
}

export function useCardSetDetails(cardSetId: UUID) {
  const [state, setState] = useState<CardSetDetailsState>({
    isLoading: true,
    error: null,
    cardSet: null,
    filteredCards: null,
    searchTerm: "",
  });

  const setError = useCallback((error: Error | ApiError) => {
    setState((prev) => ({
      ...prev,
      error: error.message || "Wystąpił nieznany błąd",
      isLoading: false,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const fetchCardSet = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await handleApiResponse<CardSetDetailDTO>(await fetch(`/api/card-sets/${cardSetId}`));
      setState((prev) => ({ ...prev, cardSet: data, isLoading: false }));
    } catch (error) {
      setError(error instanceof Error ? error : { message: "Nie udało się pobrać zestawu fiszek" });
    }
  }, [cardSetId, setError]);

  const updateCardSetName = useCallback(
    async (name: string) => {
      if (!state.cardSet) return;
      clearError();

      try {
        const updatedCardSet = await handleApiResponse<CardSetDetailDTO>(
          await fetch(`/api/card-sets/${cardSetId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          })
        );

        setState((prev) => {
          if (!prev.cardSet) return prev;
          return {
            ...prev,
            cardSet: { ...prev.cardSet, ...updatedCardSet },
          };
        });
      } catch (error) {
        setError(error instanceof Error ? error : { message: "Nie udało się zaktualizować nazwy zestawu" });
        throw error;
      }
    },
    [cardSetId, state.cardSet, setError, clearError]
  );

  const deleteCardSet = useCallback(async () => {
    clearError();
    try {
      await handleApiResponse<{ message: string }>(
        await fetch(`/api/card-sets/${cardSetId}`, {
          method: "DELETE",
        })
      );
      redirectTo("/card-sets");
    } catch (error) {
      setError(error instanceof Error ? error : { message: "Nie udało się usunąć zestawu" });
      throw error;
    }
  }, [cardSetId, setError, clearError]);

  const updateCard = useCallback(
    async (cardId: UUID, data: UpdateCardCommand) => {
      if (!state.cardSet) return;
      clearError();

      try {
        const updatedCard = await handleApiResponse<CardDTO>(
          await fetch(`/api/card-sets/${cardSetId}/cards/${cardId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          })
        );

        setState((prev) => {
          if (!prev.cardSet) return prev;
          return {
            ...prev,
            cardSet: {
              ...prev.cardSet,
              cards: prev.cardSet.cards.map((card) => (card.id === cardId ? updatedCard : card)),
            },
          };
        });
      } catch (error) {
        setError(error instanceof Error ? error : { message: "Nie udało się zaktualizować fiszki" });
        throw error;
      }
    },
    [cardSetId, state.cardSet, setError, clearError]
  );

  const deleteCard = useCallback(
    async (cardId: UUID) => {
      if (!state.cardSet) return;
      clearError();

      try {
        await handleApiResponse<{ message: string }>(
          await fetch(`/api/card-sets/${cardSetId}/cards/${cardId}`, {
            method: "DELETE",
          })
        );

        setState((prev) => {
          if (!prev.cardSet) return prev;
          return {
            ...prev,
            cardSet: {
              ...prev.cardSet,
              cards: prev.cardSet.cards.filter((card) => card.id !== cardId),
            },
          };
        });
      } catch (error) {
        setError(error instanceof Error ? error : { message: "Nie udało się usunąć fiszki" });
        throw error;
      }
    },
    [cardSetId, state.cardSet, setError, clearError]
  );

  const setSearchTerm = useCallback((term: string) => {
    setState((prev) => {
      if (!prev.cardSet) return prev;

      const filtered = term
        ? prev.cardSet.cards.filter(
            (card) =>
              card.front.toLowerCase().includes(term.toLowerCase()) ||
              card.back.toLowerCase().includes(term.toLowerCase())
          )
        : null;

      return {
        ...prev,
        searchTerm: term,
        filteredCards: filtered,
      };
    });
  }, []);

  useEffect(() => {
    fetchCardSet();
  }, [fetchCardSet]);

  const retry = useCallback(() => {
    fetchCardSet();
  }, [fetchCardSet]);

  return {
    ...state,
    updateCardSetName,
    deleteCardSet,
    updateCard,
    deleteCard,
    setSearchTerm,
    retry,
  };
}
