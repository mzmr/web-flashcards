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
import { useLocalStorage } from "@/components/hooks/useLocalStorage";

interface NewCardSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardSetAdded: (cardSet: CardSetDTO) => void;
  isAuthenticated?: boolean;
}

export function NewCardSetModal({ isOpen, onClose, onCardSetAdded, isAuthenticated }: NewCardSetModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createCardSet } = useLocalStorage();

  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return "Nazwa zestawu jest wymagana";
    }
    if (name.length > 100) {
      return "Nazwa zestawu nie może być dłuższa niż 100 znaków";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let newCardSet: CardSetDTO;

      if (isAuthenticated) {
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

        newCardSet = await response.json();
      } else {
        newCardSet = createCardSet(name.trim());
      }

      onCardSetAdded(newCardSet);
      setName("");
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} data-testid="new-card-set-modal">
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nowy zestaw fiszek</DialogTitle>
            <DialogDescription>
              {isAuthenticated
                ? "Wprowadź nazwę dla nowego zestawu fiszek. Później będziesz mógł dodać do niego fiszki."
                : "Wprowadź nazwę dla nowego lokalnego zestawu fiszek. Zestaw zostanie zapisany w pamięci przeglądarki."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="name" className="text-right">
              Nazwa zestawu
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Wprowadź nazwę zestawu..."
              className="mt-2"
              disabled={isLoading}
              data-testid="card-set-name-input"
            />
            {error && (
              <p className="text-sm text-destructive mt-2" data-testid="error-message">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} data-testid="cancel-button">
              Anuluj
            </Button>
            <Button type="submit" disabled={isLoading} data-testid="create-card-set-button">
              {isLoading ? "Tworzenie..." : "Utwórz zestaw"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
