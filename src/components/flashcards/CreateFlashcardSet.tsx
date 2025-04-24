import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";

export const CreateFlashcardSet = () => {
  const [name, setName] = useState("");
  const { createFlashcardSet } = useLocalStorage();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Błąd",
        description: "Nazwa zestawu nie może być pusta",
        variant: "destructive",
      });
      return;
    }

    if (name.length > 300) {
      toast({
        title: "Błąd",
        description: "Nazwa zestawu nie może przekraczać 300 znaków",
        variant: "destructive",
      });
      return;
    }

    createFlashcardSet(name);
    setName("");
    toast({
      title: "Sukces",
      description: "Utworzono nowy zestaw fiszek",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nazwa zestawu</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Wprowadź nazwę zestawu fiszek"
          maxLength={300}
        />
      </div>
      <Button type="submit">Utwórz zestaw</Button>
    </form>
  );
};
