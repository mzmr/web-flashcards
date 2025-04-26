import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { redirectTo } from "@/lib/api/helpers";
import { memo } from "react";
import type { TemporaryCard, UpdateCardCommand } from "@/types";
import { AIGenerationForm } from "./AIGenerationForm";
import { TemporaryCardList } from "./TemporaryCardList";
import { EditCardDialog } from "./EditCardDialog";
import { useCardSet } from "@/components/hooks/useCardSet";
import { useTemporaryCards } from "@/components/hooks/useTemporaryCards";

interface AddCardsPageProps {
  cardSetId: string;
  isAuthenticated?: boolean;
}

// Komponenty pomocnicze
const Header = memo(function Header({ name, onBack }: { name: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h1 className="text-2xl font-bold">Dodaj fiszki do zestawu: {name}</h1>
    </div>
  );
});

const Actions = memo(function Actions({
  onManualAdd,
  onSubmit,
  cardsCount,
}: {
  onManualAdd: () => void;
  onSubmit: () => void;
  cardsCount: number;
}) {
  return (
    <div className="flex justify-between items-center">
      <Button variant="outline" onClick={onManualAdd}>
        Dodaj ręcznie
      </Button>
      <Button variant="default" disabled={cardsCount === 0} onClick={onSubmit}>
        Zatwierdź wszystkie ({cardsCount})
      </Button>
    </div>
  );
});

export function AddCardsPage({ cardSetId, isAuthenticated }: AddCardsPageProps) {
  const { cardSet, isLoading } = useCardSet(cardSetId);
  const {
    temporaryCards,
    editingCard,
    addCards,
    editCard,
    deleteCard,
    addManualCard,
    saveCard,
    submitAll,
    setEditingCard,
  } = useTemporaryCards(cardSetId);

  const handleBack = () => {
    redirectTo(`/card-sets/${cardSetId}`);
  };

  const handleSaveCard = async (data: UpdateCardCommand) => {
    saveCard(data as TemporaryCard);
  };

  if (isLoading || !cardSet) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Header name={cardSet.name} onBack={handleBack} />

      <div className="grid gap-6">
        {isAuthenticated && !cardSet.isLocal && <AIGenerationForm onGenerate={addCards} />}

        <Actions
          onManualAdd={addManualCard}
          onSubmit={() => submitAll(cardSet.isLocal ?? false)}
          cardsCount={temporaryCards.length}
        />

        <TemporaryCardList cards={temporaryCards} onEdit={editCard} onDelete={deleteCard} />
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
