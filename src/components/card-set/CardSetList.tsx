import { memo } from "react";
import type { CardSetDTO } from "@/types";
import { CardSetItem } from "./CardSetItem";

interface CardSetListProps {
  cardSets: CardSetDTO[];
}

function CardSetListComponent({ cardSets }: CardSetListProps) {
  if (cardSets.length === 0) {
    return (
      <div data-testid="card-set-grid" className="text-center py-8 text-muted-foreground">
        <p>Nie masz jeszcze żadnych zestawów fiszek.</p>
        <p>Kliknij przycisk &quot;Nowy zestaw&quot; aby utworzyć pierwszy zestaw.</p>
      </div>
    );
  }

  return (
    <div data-testid="card-set-grid" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cardSets.map((cardSet) => (
        <CardSetItem key={cardSet.id} cardSet={cardSet} href={`/card-sets/${cardSet.id}`} />
      ))}
    </div>
  );
}

export const CardSetList = memo(CardSetListComponent);

// Dodajemy displayName dla lepszego debugowania
CardSetList.displayName = "CardSetList";
