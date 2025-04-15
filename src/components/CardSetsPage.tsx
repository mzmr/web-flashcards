import { useState, useEffect } from "react";
import type { CardSetDTO, ListCardSetsResponseDTO } from "@/types";
import { CardSetSummary } from "./CardSetSummary";
import { CardSetList } from "./CardSetList";
import { NewCardSetButton } from "./NewCardSetButton";
import { NewCardSetModal } from "./NewCardSetModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CardSetsPage() {
  const [cardSets, setCardSets] = useState<CardSetDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchCardSets();
  }, [pagination.page]);

  const fetchCardSets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/card-sets?page=${pagination.page}&limit=${pagination.limit}&sort=updated_at`);

      if (!response.ok) {
        throw new Error("Nie udało się pobrać zestawów fiszek");
      }

      const data: ListCardSetsResponseDTO = await response.json();
      setCardSets(data.cardSets);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardSetAdded = (newCardSet: CardSetDTO) => {
    setCardSets((prev) => [newCardSet, ...prev]);
    setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
    setIsModalOpen(false);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.page < totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchCardSets}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <CardSetSummary total={pagination.total} />
        <NewCardSetButton onClick={() => setIsModalOpen(true)} />
      </div>

      <CardSetList cardSets={cardSets} />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button variant="outline" size="icon" onClick={handlePreviousPage} disabled={pagination.page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Strona {pagination.page} z {totalPages}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextPage} disabled={pagination.page === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <NewCardSetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCardSetAdded={handleCardSetAdded} />
    </div>
  );
}
