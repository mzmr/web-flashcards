import { useState, useEffect } from "react";
import type { CardSetDTO } from "@/types";
import { CardSetSummary } from "./CardSetSummary";
import { CardSetList } from "./CardSetList";
import { NewCardSetButton } from "./NewCardSetButton";
import { NewCardSetModal } from "./NewCardSetModal";
import { CardSetsPagination } from "./CardSetsPagination";
import { useCardSetsApi } from "@/components/hooks/useCardSetsApi";
import { useCardSetsPagination } from "@/components/hooks/useCardSetsPagination";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { Skeleton } from "@/components/ui/skeleton";

export function CardSetsPage({ isAuthenticated }: { isAuthenticated?: boolean }) {
  const [remoteCardSets, setRemoteCardSets] = useState<CardSetDTO[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { cardSets: localCardSets } = useLocalStorage();
  const { isLoading, error, fetchCardSets } = useCardSetsApi();
  const { pagination, totalPages, handlePreviousPage, handleNextPage, setTotal } = useCardSetsPagination(10);

  // Inicjalizacja stanu po załadowaniu komponentu na kliencie
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCardSets(pagination.page, pagination.limit)
        .then((data) => {
          setRemoteCardSets(data.cardSets);
          setTotal(data.pagination.total);
        })
        .catch(() => {
          // Error jest już obsługiwany w hooku useCardSetsApi
        });
    }
  }, [isAuthenticated, pagination.page, pagination.limit, fetchCardSets, setTotal]);

  const handleCardSetAdded = (newCardSet: CardSetDTO) => {
    if (!isAuthenticated) {
      return;
    }

    setRemoteCardSets((prev) => [newCardSet, ...prev]);
    setTotal(pagination.total + 1);
  };

  // Łączymy i sortujemy zestawy tylko po inicjalizacji na kliencie
  const allCardSets = isInitialized
    ? [...remoteCardSets, ...localCardSets].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
    : [];

  const totalSets = isInitialized
    ? isAuthenticated
      ? pagination.total + localCardSets.length
      : localCardSets.length
    : 0;

  if (!isInitialized || isLoading) {
    return (
      <main className="container mx-auto p-4 space-y-6">
        <h1 className="sr-only">Zestawy fiszek</h1>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" data-testid="skeleton" />
          <Skeleton className="h-10 w-32" data-testid="skeleton" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" data-testid="skeleton" />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-4 text-center">
        <h1 className="sr-only">Zestawy fiszek</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchCardSets(1, pagination.limit)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Spróbuj ponownie
        </button>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 space-y-6">
      <h1 className="sr-only">Zestawy fiszek</h1>
      <div className="flex justify-between items-center">
        <CardSetSummary total={totalSets} />
        <NewCardSetButton onClick={() => setIsModalOpen(true)} />
      </div>

      <CardSetList cardSets={allCardSets} />

      {isAuthenticated && totalPages > 1 && (
        <CardSetsPagination
          currentPage={pagination.page}
          totalPages={totalPages}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
        />
      )}

      <NewCardSetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCardSetAdded={handleCardSetAdded}
        isAuthenticated={isAuthenticated}
      />
    </main>
  );
}
