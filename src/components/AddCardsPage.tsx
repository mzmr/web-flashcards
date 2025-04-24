import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { redirectTo } from "@/lib/api/helpers";
import { useState, useEffect } from "react";
import type { TemporaryCard, UpdateCardCommand, CardSetDTO } from "@/types";
import { AIGenerationForm } from "./AIGenerationForm";
import { TemporaryCardList } from "./TemporaryCardList";
import { EditCardDialog } from "./card/EditCardDialog";
import { toast } from "sonner";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";

interface AddCardsPageProps {
  cardSetId: string;
  isAuthenticated?: boolean;
}

export function AddCardsPage({ cardSetId, isAuthenticated }: AddCardsPageProps) {
  const [temporaryCards, setTemporaryCards] = useState<TemporaryCard[]>([]);
  const [editingCard, setEditingCard] = useState<TemporaryCard | null>(null);
  const [cardSet, setCardSet] = useState<CardSetDTO | null>(null);
  const { cardSets, addCard } = useLocalStorage();

  useEffect(() => {
    // Sprawdź czy to lokalny zestaw
    const localSet = cardSets.find((set) => set.id === cardSetId);
    if (localSet) {
      setCardSet(localSet);
      return;
    }

    // Jeśli nie lokalny, pobierz z API
    const fetchCardSet = async () => {
      try {
        const response = await fetch(`/api/card-sets/${cardSetId}`);
        if (!response.ok) throw new Error("Nie udało się pobrać zestawu");
        const data = await response.json();
        setCardSet(data);
      } catch {
        toast.error("Nie udało się pobrać zestawu");
        redirectTo("/card-sets");
      }
    };

    fetchCardSet();
  }, [cardSetId, cardSets]);

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
    if (!cardSet) return;

    try {
      if (!cardSet.isLocal) {
        // Zapisz do API
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
      } else {
        // Zapisz lokalnie
        temporaryCards.forEach((card) => {
          addCard(cardSetId, card.front, card.back);
        });
      }

      redirectTo(`/card-sets/${cardSetId}`);
    } catch {
      toast.error("Nie udało się zapisać fiszek", {
        description: "Spróbuj ponownie później",
      });
    }
  };

  if (!cardSet) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Dodaj fiszki do zestawu: {cardSet.name}</h1>
      </div>

      <div className="grid gap-6">
        {isAuthenticated && !cardSet.isLocal && <AIGenerationForm onGenerate={handleAddCards} />}

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
