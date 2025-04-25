import { memo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditCardDialog } from "./card/EditCardDialog";
import { DeleteCardDialog } from "./card/DeleteCardDialog";
import { FlashcardContent } from "./card/CardContent";
import type { CardDTO, UpdateCardCommand } from "@/types";
import { sourceLabels, sourceBadgeVariants } from "@/lib/constants";

interface CardItemProps {
  card: CardDTO;
  onUpdate: (data: UpdateCardCommand) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const CardItem = memo(function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <>
      <Card role="listitem">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Badge variant={sourceBadgeVariants[card.source]}>{sourceLabels[card.source]}</Badge>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
              aria-label="edytuj kartę"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsConfirmingDelete(true)}
              aria-label="usuń kartę"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <FlashcardContent front={card.front} back={card.back} />
        </CardContent>
      </Card>

      <EditCardDialog
        card={{
          tempId: card.id,
          front: card.front,
          back: card.back,
          source: card.source,
          generation_id: card.generation_id ?? undefined,
        }}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        onSave={onUpdate}
        mode="edit"
      />

      <DeleteCardDialog isOpen={isConfirmingDelete} onOpenChange={setIsConfirmingDelete} onDelete={onDelete} />
    </>
  );
});
