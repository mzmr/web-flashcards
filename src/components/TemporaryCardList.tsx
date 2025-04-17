import type { TemporaryCard } from "@/types";
import { TemporaryCardItem } from "./TemporaryCardItem";

interface TemporaryCardListProps {
  cards: TemporaryCard[];
  onEdit: (card: TemporaryCard) => void;
  onDelete: (tempId: string) => void;
}

export function TemporaryCardList({ cards, onEdit, onDelete }: TemporaryCardListProps) {
  if (cards.length === 0) {
    return <div className="text-center text-muted-foreground py-8">Brak fiszek do wyświetlenia</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <TemporaryCardItem
          key={card.tempId}
          card={card}
          onEdit={() => onEdit(card)}
          onDelete={() => onDelete(card.tempId)}
        />
      ))}
    </div>
  );
}
