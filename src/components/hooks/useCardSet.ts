import { useState, useEffect } from "react";
import type { CardSetDTO } from "@/types";
import { cardSetsApi } from "@/lib/api/cardSets";
import { useLocalStorage } from "./useLocalStorage";
import { toast } from "sonner";
import { redirectTo } from "@/lib/api/helpers";

export function useCardSet(cardSetId: string) {
  const [cardSet, setCardSet] = useState<CardSetDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { cardSets } = useLocalStorage();

  useEffect(() => {
    const fetchCardSet = async () => {
      try {
        // Sprawdź czy to lokalny zestaw
        const localSet = cardSets.find((set) => set.id === cardSetId);
        if (localSet) {
          setCardSet(localSet);
          setIsLoading(false);
          return;
        }

        // Jeśli nie lokalny, pobierz z API
        const data = await cardSetsApi.getCardSet(cardSetId);
        setCardSet(data);
      } catch {
        toast.error("Nie udało się pobrać zestawu");
        redirectTo("/card-sets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardSet();
  }, [cardSetId, cardSets]);

  return { cardSet, isLoading };
}
