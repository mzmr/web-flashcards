import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { redirectTo } from "@/lib/api/helpers";

interface AddCardsButtonProps {
  cardSetId: string;
}

export function AddCardsButton({ cardSetId }: AddCardsButtonProps) {
  const handleClick = () => {
    redirectTo(`/card-sets/${cardSetId}/add-cards`);
  };

  return (
    <Button onClick={handleClick} variant="default" size="sm" className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Dodaj fiszki
    </Button>
  );
}
