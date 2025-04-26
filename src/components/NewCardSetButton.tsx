import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NewCardSetButtonProps {
  onClick: () => void;
}

export function NewCardSetButton({ onClick }: NewCardSetButtonProps) {
  return (
    <Button onClick={onClick} size="lg" data-testid="new-card-set-button">
      <Plus className="w-5 h-5 mr-2" />
      Nowy zestaw
    </Button>
  );
}
