import { useState, memo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CardDTO, CardSource, UpdateCardCommand } from "@/types";
import { EditCardDialog } from "./card/EditCardDialog";
import { DeleteCardDialog } from "./card/DeleteCardDialog";
import { FlashcardContent } from "./card/CardContent";

interface CardItemProps {
  card: CardDTO;
  onUpdate: (data: UpdateCardCommand) => Promise<void>;
  onDelete: () => Promise<void>;
}

const sourceLabels: Record<CardSource, string> = {
  ai_generated: "Wygenerowane przez AI",
  ai_edited: "Wygenerowane przez AI, edytowane",
  user_created: "Utworzone ręcznie",
};

export const CardItem = memo(function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Badge variant="secondary">{sourceLabels[card.source]}</Badge>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsConfirmingDelete(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <FlashcardContent front={card.front} back={card.back} />
        </CardContent>
      </Card>

      <EditCardDialog card={card} isOpen={isEditing} onOpenChange={setIsEditing} onUpdate={onUpdate} />

      <DeleteCardDialog isOpen={isConfirmingDelete} onOpenChange={setIsConfirmingDelete} onDelete={onDelete} />
    </>
  );
});
