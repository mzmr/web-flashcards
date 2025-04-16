import type { CardDTO, UpdateCardCommand } from "@/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface EditCardDialogProps {
  card: CardDTO;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: UpdateCardCommand) => Promise<void>;
}

export function EditCardDialog({ card, isOpen, onOpenChange, onUpdate }: EditCardDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editData, setEditData] = useState<UpdateCardCommand>({
    front: card.front,
    back: card.back,
  });

  // Resetuj pola tekstowe przy otwarciu modala
  useEffect(() => {
    if (isOpen) {
      setEditData({
        front: card.front,
        back: card.back,
      });
    }
  }, [isOpen, card.front, card.back]);

  const handleUpdate = async () => {
    if (editData.front.trim() === "" || editData.back.trim() === "") return;
    setIsSubmitting(true);
    try {
      await onUpdate({
        front: editData.front.trim(),
        back: editData.back.trim(),
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
          <DialogDescription>Wprowadź nową treść dla przodu i tyłu fiszki.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="front" className="text-sm font-medium">
              Przód
            </label>
            <Textarea
              id="front"
              value={editData.front}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setEditData((prev) => ({ ...prev, front: e.target.value }))
              }
              placeholder="Wprowadź treść przodu fiszki"
              maxLength={300}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="back" className="text-sm font-medium">
              Tył
            </label>
            <Textarea
              id="back"
              value={editData.back}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setEditData((prev) => ({ ...prev, back: e.target.value }))
              }
              placeholder="Wprowadź treść tyłu fiszki"
              maxLength={300}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Anuluj
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={
              isSubmitting ||
              editData.front.trim() === "" ||
              editData.back.trim() === "" ||
              (editData.front.trim() === card.front && editData.back.trim() === card.back)
            }
          >
            {isSubmitting ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
