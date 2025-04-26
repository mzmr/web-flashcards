import { memo } from "react";
import type { CardDTO, UpdateCardCommand } from "@/types";
import { CardItem } from "./CardItem";

interface CardsListProps {
  cards: CardDTO[];
  onUpdateCard: (cardId: string, data: UpdateCardCommand) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export const CardsList = memo(function CardsList({ cards, onUpdateCard, onDeleteCard }: CardsListProps) {
  if (cards.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nie znaleziono żadnych fiszek</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onUpdate={(data: UpdateCardCommand) => onUpdateCard(card.id, data)}
          onDelete={() => onDeleteCard(card.id)}
        />
      ))}
    </div>
  );
});
