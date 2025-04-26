import { Button } from "@/components/ui/button";
import { Cloud } from "lucide-react";
import type { CardSetDetailDTO } from "@/types";

interface SaveToCloudButtonProps {
  cardSet: CardSetDetailDTO;
  onSave: () => Promise<void>;
  disabled?: boolean;
}

export function SaveToCloudButton({ cardSet, onSave, disabled }: SaveToCloudButtonProps) {
  if (!cardSet.isLocal) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={onSave}
      disabled={disabled}
      aria-label={disabled ? "zapisywanie" : "zapisz w chmurze"}
    >
      <Cloud className="h-4 w-4" />
      Zapisz w chmurze
    </Button>
  );
}
