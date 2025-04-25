import { useState } from "react";
import { ChevronLeft, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CardSetDetailDTO } from "@/types";
import { redirectTo } from "@/lib/api/helpers";
import { SaveToCloudButton } from "./SaveToCloudButton";

interface CardSetHeaderProps {
  cardSet: CardSetDetailDTO;
  onUpdateName: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onSaveToCloud: () => Promise<void>;
  isSaving?: boolean;
}

export function CardSetHeader({ cardSet, onUpdateName, onDelete, onSaveToCloud, isSaving }: CardSetHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [newName, setNewName] = useState(cardSet.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateName = async () => {
    if (newName.trim() === "") return;
    setIsSubmitting(true);
    try {
      await onUpdateName(newName.trim());
      setIsEditingName(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete();
    } finally {
      setIsSubmitting(false);
      setIsConfirmingDelete(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => redirectTo("/card-sets")} aria-label="Powrót">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{cardSet.name}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setNewName(cardSet.name);
            setIsEditingName(true);
          }}
          aria-label="Edytuj nazwę"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <SaveToCloudButton cardSet={cardSet} onSave={onSaveToCloud} disabled={isSaving} />
        <Button variant="default" onClick={() => redirectTo(`/card-sets/${cardSet.id}/add-cards`)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj fiszki
        </Button>
        <Button variant="destructive" size="icon" onClick={() => setIsConfirmingDelete(true)} aria-label="Usuń zestaw">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Dialog edycji nazwy */}
      <Dialog open={isEditingName} onOpenChange={setIsEditingName}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj nazwę zestawu</DialogTitle>
            <DialogDescription>Wprowadź nową nazwę dla zestawu fiszek.</DialogDescription>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nazwa zestawu"
            maxLength={100}
            id="card-set-name"
            aria-label="Nazwa zestawu"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingName(false)} aria-label="Anuluj edycję nazwy zestawu">
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={!newName || newName === cardSet.name || isSubmitting}
              aria-label={isSubmitting ? "zapisywanie" : "zapisz zmiany"}
              onClick={handleUpdateName}
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog potwierdzenia usunięcia */}
      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń zestaw</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć ten zestaw fiszek? Tej operacji nie można cofnąć.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmingDelete(false)} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
