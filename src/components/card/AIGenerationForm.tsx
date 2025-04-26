import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { GenerateFlashcardsResponseDTO, TemporaryCard } from "@/types";
import { Loader2 } from "lucide-react";

interface AIGenerationFormProps {
  onGenerate: (cards: Omit<TemporaryCard, "tempId">[]) => void;
}

const MIN_TEXT_LENGTH = 1000;
const MAX_TEXT_LENGTH = 10000;

export function AIGenerationForm({ onGenerate }: AIGenerationFormProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textLength = text.length;
  const isValid = textLength >= MIN_TEXT_LENGTH && textLength <= MAX_TEXT_LENGTH;

  const getValidationError = () => {
    if (textLength === 0) return null;
    if (textLength < MIN_TEXT_LENGTH) {
      return `Tekst jest za krótki. Minimalna długość to ${MIN_TEXT_LENGTH} znaków.`;
    }
    if (textLength > MAX_TEXT_LENGTH) {
      return `Tekst jest za długi. Maksymalna długość to ${MAX_TEXT_LENGTH} znaków.`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input_text: text }),
      });

      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas generowania fiszek");
      }

      const data: GenerateFlashcardsResponseDTO = await response.json();
      const cards = data.cards.map((card) => ({
        ...card,
        source: "ai_generated" as const,
        generation_id: data.generation_id,
      }));
      onGenerate(cards);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
    } finally {
      setIsLoading(false);
    }
  };

  const validationError = getValidationError();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generuj fiszki z tekstu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
              }}
              placeholder={`Wklej tekst źródłowy (${MIN_TEXT_LENGTH}-${MAX_TEXT_LENGTH} znaków)...`}
              className={`h-[200px] ${validationError ? "border-destructive" : ""}`}
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm">
              <div className={textLength > MAX_TEXT_LENGTH ? "text-destructive" : "text-muted-foreground"}>
                {textLength}/{MAX_TEXT_LENGTH} znaków
              </div>
              {validationError && <div className="text-destructive">{validationError}</div>}
            </div>
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" disabled={!isValid || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generowanie...
              </>
            ) : (
              "Generuj fiszki"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
