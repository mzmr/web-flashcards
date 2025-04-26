import { memo } from "react";
import type { CardSetDTO } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CardSetItemProps {
  cardSet: CardSetDTO;
  href: string;
}

function CardSetItemComponent({ cardSet, href }: CardSetItemProps) {
  return (
    <a href={href} className="block">
      <Card data-testid={`card-set-${cardSet.id}`} className="hover:bg-accent/50 transition-colors h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{cardSet.name}</CardTitle>
            {cardSet.isLocal && <Badge variant="secondary">Lokalny</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Ostatnia modyfikacja: {formatDate(cardSet.updated_at)}</p>
        </CardContent>
      </Card>
    </a>
  );
}

function arePropsEqual(prevProps: CardSetItemProps, nextProps: CardSetItemProps) {
  return (
    prevProps.href === nextProps.href &&
    prevProps.cardSet.id === nextProps.cardSet.id &&
    prevProps.cardSet.name === nextProps.cardSet.name &&
    prevProps.cardSet.isLocal === nextProps.cardSet.isLocal &&
    prevProps.cardSet.updated_at === nextProps.cardSet.updated_at
  );
}

export const CardSetItem = memo(CardSetItemComponent, arePropsEqual);

// Dodajemy displayName dla lepszego debugowania
CardSetItem.displayName = "CardSetItem";
