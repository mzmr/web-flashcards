import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TemporaryCard } from "@/types";
import { sourceLabels, sourceBadgeVariants } from "@/lib/constants";

interface TemporaryCardItemProps {
  card: TemporaryCard;
  onEdit: () => void;
  onDelete: () => void;
}

export function TemporaryCardItem({ card, onEdit, onDelete }: TemporaryCardItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={sourceBadgeVariants[card.source]}>{sourceLabels[card.source]}</Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <div className="font-medium">Przód</div>
              <div className="text-sm text-muted-foreground">{card.front}</div>
            </div>
            <div>
              <div className="font-medium">Tył</div>
              <div className="text-sm text-muted-foreground">{card.back}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
