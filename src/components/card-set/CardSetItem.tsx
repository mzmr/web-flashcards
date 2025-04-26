import type { CardSetDTO } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CardSetItemProps {
  cardSet: CardSetDTO;
  href: string;
}

export function CardSetItem({ cardSet, href }: CardSetItemProps) {
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
