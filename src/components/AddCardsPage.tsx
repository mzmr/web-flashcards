import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { redirectTo } from "@/lib/api/helpers";
import { useState } from "react";
import type { TemporaryCard, UpdateCardCommand } from "@/types";
import { AIGenerationForm } from "./AIGenerationForm";
import { TemporaryCardList } from "./TemporaryCardList";
import { EditCardDialog } from "./card/EditCardDialog";
import { toast } from "sonner";

export function AddCardsPage({ cardSetId }: { cardSetId: string }) {
  const [temporaryCards, setTemporaryCards] = useState<TemporaryCard[]>([]);
  const [editingCard, setEditingCard] = useState<TemporaryCard | null>(null);

  const handleBack = () => {
    redirectTo(`/card-sets/${cardSetId}`);
  };

  const handleAddCards = async (cards: Omit<TemporaryCard, "tempId">[]) => {
    const newCards = cards.map((card) => ({
      ...card,
      tempId: crypto.randomUUID(),
    }));
    setTemporaryCards((prev) => [...prev, ...newCards]);
  };

  const handleEditCard = (card: TemporaryCard) => {
    setEditingCard(card);
  };

  const handleDeleteCard = (tempId: string) => {
    setTemporaryCards((prev) => prev.filter((card) => card.tempId !== tempId));
  };

  const handleManualAdd = () => {
    setEditingCard({
      tempId: "",
      front: "",
      back: "",
      source: "user_created",
    });
  };

  const handleSaveCard = async (data: UpdateCardCommand) => {
    if (editingCard) {
      if (editingCard.tempId) {
        // Edycja istniejącej fiszki
        setTemporaryCards((prev) =>
          prev.map((card) =>
            card.tempId === editingCard.tempId
              ? {
                  ...card,
                  ...data,
                  source: card.source === "ai_generated" ? "ai_edited" : card.source,
                }
              : card
          )
        );
      } else {
        // Dodawanie nowej fiszki
        setTemporaryCards((prev) => [
          ...prev,
          {
            ...editingCard,
            ...data,
            tempId: crypto.randomUUID(),
          },
        ]);
      }
    }
  };

  const handleSubmitAll = async () => {
    try {
      const response = await fetch(`/api/card-sets/${cardSetId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cards: temporaryCards.map((temp) => ({
            front: temp.front,
            back: temp.back,
            source: temp.source,
            generation_id: temp.generation_id,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas zapisywania fiszek");
      }

      redirectTo(`/card-sets/${cardSetId}`);
    } catch {
      toast.error("Nie udało się zapisać fiszek", {
        description: "Spróbuj ponownie później",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Dodaj fiszki</h1>
      </div>

      <div className="grid gap-6">
        <AIGenerationForm onGenerate={handleAddCards} />

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleManualAdd}>
            Dodaj ręcznie
          </Button>
          <Button variant="default" disabled={temporaryCards.length === 0} onClick={handleSubmitAll}>
            Zatwierdź wszystkie ({temporaryCards.length})
          </Button>
        </div>

        <TemporaryCardList cards={temporaryCards} onEdit={handleEditCard} onDelete={handleDeleteCard} />
      </div>

      <EditCardDialog
        card={editingCard ?? undefined}
        isOpen={editingCard !== null}
        onOpenChange={(open) => !open && setEditingCard(null)}
        onSave={handleSaveCard}
        mode={editingCard?.tempId ? "edit" : "add"}
      />
    </div>
  );
}
