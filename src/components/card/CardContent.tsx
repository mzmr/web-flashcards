import { memo } from "react";

interface CardContentProps {
  front: string;
  back: string;
}

export const FlashcardContent = memo(function FlashcardContent({ front, back }: CardContentProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Przód:</p>
        <p className="text-sm text-muted-foreground">{front}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Tył:</p>
        <p className="text-sm text-muted-foreground">{back}</p>
      </div>
    </div>
  );
});
