import { useState } from "react";
import type { CardSetDTO } from "@/types";
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
import { Label } from "@/components/ui/label";

interface NewCardSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardSetAdded: (cardSet: CardSetDTO) => void;
}

export function NewCardSetModal({ isOpen, onClose, onCardSetAdded }: NewCardSetModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Nazwa zestawu jest wymagana");
      return;
    }

    if (name.length > 100) {
      setError("Nazwa zestawu nie może być dłuższa niż 100 znaków");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/card-sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Nie udało się utworzyć zestawu");
      }

      const newCardSet: CardSetDTO = await response.json();
      onCardSetAdded(newCardSet);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nowy zestaw fiszek</DialogTitle>
            <DialogDescription>
              Wprowadź nazwę dla nowego zestawu fiszek. Później będziesz mógł dodać do niego fiszki.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="name" className="text-right">
              Nazwa zestawu
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Wprowadź nazwę zestawu..."
              className="mt-2"
              disabled={isLoading}
            />
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Tworzenie..." : "Utwórz zestaw"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
