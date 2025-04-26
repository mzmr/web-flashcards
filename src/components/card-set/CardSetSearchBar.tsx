import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CardSetSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function CardSetSearchBar({ value, onChange }: CardSetSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Szukaj fiszek..."
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-8"
        data-testid="card-search-input"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
          onClick={() => onChange("")}
          data-testid="clear-search-button"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
