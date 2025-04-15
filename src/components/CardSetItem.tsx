import type { CardSetDTO } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface CardSetItemProps {
  cardSet: CardSetDTO;
  href: string;
}

export function CardSetItem({ cardSet, href }: CardSetItemProps) {
  return (
    <a href={href} className="block">
      <Card className="hover:bg-accent/50 transition-colors h-full">
        <CardHeader>
          <CardTitle className="text-xl">{cardSet.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Ostatnia modyfikacja: {formatDate(cardSet.updated_at)}</p>
        </CardContent>
      </Card>
    </a>
  );
}
