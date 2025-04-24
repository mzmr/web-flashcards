import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { CardSetDTO, CardDTO, LocalStorageState, UUID } from "@/types";

const LOCAL_STORAGE_KEY = "flashcards-state";

const getInitialState = (): LocalStorageState => {
  if (typeof window === "undefined") {
    return { cardSets: [], lastUpdate: new Date().toISOString() };
  }

  const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!savedState) {
    return { cardSets: [], lastUpdate: new Date().toISOString() };
  }

  try {
    return JSON.parse(savedState);
  } catch {
    return { cardSets: [], lastUpdate: new Date().toISOString() };
  }
};

export const useLocalStorage = () => {
  const [state, setState] = useState<LocalStorageState>(getInitialState);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const createCardSet = useCallback((name: string): CardSetDTO => {
    const newSet: CardSetDTO = {
      id: uuidv4() as UUID,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isLocal: true,
      cards: [],
    };

    setState((prev) => ({
      cardSets: [...prev.cardSets, newSet],
      lastUpdate: new Date().toISOString(),
    }));

    return newSet;
  }, []);

  const updateCardSet = useCallback((id: UUID, name: string) => {
    setState((prev) => ({
      cardSets: prev.cardSets.map((set) =>
        set.id === id ? { ...set, name, updated_at: new Date().toISOString() } : set
      ),
      lastUpdate: new Date().toISOString(),
    }));
  }, []);

  const deleteCardSet = useCallback((id: UUID) => {
    setState((prev) => ({
      cardSets: prev.cardSets.filter((set) => set.id !== id),
      lastUpdate: new Date().toISOString(),
    }));
  }, []);

  const addCard = useCallback((setId: UUID, front: string, back: string): CardDTO => {
    const newCard: CardDTO = {
      id: uuidv4() as UUID,
      front,
      back,
      source: "user_created",
      generation_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setState((prev) => ({
      cardSets: prev.cardSets.map((set) =>
        set.id === setId
          ? {
              ...set,
              cards: [...(set.cards || []), newCard],
              updated_at: new Date().toISOString(),
            }
          : set
      ),
      lastUpdate: new Date().toISOString(),
    }));

    return newCard;
  }, []);

  const updateCard = useCallback((setId: UUID, cardId: UUID, front: string, back: string) => {
    setState((prev) => ({
      cardSets: prev.cardSets.map((set) =>
        set.id === setId
          ? {
              ...set,
              cards: (set.cards || []).map((card) =>
                card.id === cardId ? { ...card, front, back, updated_at: new Date().toISOString() } : card
              ),
              updated_at: new Date().toISOString(),
            }
          : set
      ),
      lastUpdate: new Date().toISOString(),
    }));
  }, []);

  const deleteCard = useCallback((setId: UUID, cardId: UUID) => {
    setState((prev) => ({
      cardSets: prev.cardSets.map((set) =>
        set.id === setId
          ? {
              ...set,
              cards: (set.cards || []).filter((card) => card.id !== cardId),
              updated_at: new Date().toISOString(),
            }
          : set
      ),
      lastUpdate: new Date().toISOString(),
    }));
  }, []);

  const getCardSet = useCallback(
    (id: UUID): CardSetDTO | null => {
      return state.cardSets.find((set) => set.id === id) || null;
    },
    [state.cardSets]
  );

  return {
    cardSets: state.cardSets,
    createCardSet,
    updateCardSet,
    deleteCardSet,
    getCardSet,
    addCard,
    updateCard,
    deleteCard,
  };
};
