import { useState, useCallback } from "react";
import type { ListCardSetsResponseDTO } from "@/types";

interface UseCardSetsApiReturn {
  isLoading: boolean;
  error: string | null;
  fetchCardSets: (page: number, limit: number) => Promise<ListCardSetsResponseDTO>;
}

export const useCardSetsApi = (): UseCardSetsApiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCardSets = useCallback(async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/card-sets?page=${page}&limit=${limit}&sort=updated_at`);

      if (!response.ok) {
        throw new Error("Nie udało się pobrać zestawów fiszek");
      }

      const data: ListCardSetsResponseDTO = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    fetchCardSets,
  };
};
