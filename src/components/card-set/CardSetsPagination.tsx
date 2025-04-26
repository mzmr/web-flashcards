import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardSetsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function CardSetsPagination({ currentPage, totalPages, onPreviousPage, onNextPage }: CardSetsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <Button
        variant="outline"
        size="icon"
        onClick={onPreviousPage}
        disabled={currentPage === 1}
        aria-label="Poprzednia strona"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        Strona {currentPage} z {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={onNextPage}
        disabled={currentPage === totalPages}
        aria-label="Następna strona"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
