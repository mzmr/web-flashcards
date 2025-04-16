import type { UUID } from "@/types";
import { useCardSetDetails } from "@/components/hooks/useCardSetDetails";
import { CardSetHeader } from "./CardSetHeader";
import { CardSetSearchBar } from "./CardSetSearchBar";
import { CardsList } from "./CardsList";
import { Spinner } from "./ui/spinner";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

interface CardSetDetailsPageProps {
  cardSetId: UUID;
}

export function CardSetDetailsPage({ cardSetId }: CardSetDetailsPageProps) {
  const {
    isLoading,
    error,
    cardSet,
    filteredCards,
    searchTerm,
    updateCardSetName,
    deleteCardSet,
    updateCard,
    deleteCard,
    setSearchTerm,
  } = useCardSetDetails(cardSetId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!cardSet) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <CardSetHeader cardSet={cardSet} onUpdateName={updateCardSetName} onDelete={deleteCardSet} />

      <div className="mt-8">
        <CardSetSearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="mt-8">
        <CardsList cards={filteredCards || cardSet.cards} onUpdateCard={updateCard} onDeleteCard={deleteCard} />
      </div>
    </div>
  );
}
