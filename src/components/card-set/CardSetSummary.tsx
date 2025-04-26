interface CardSetSummaryProps {
  total: number;
}

export function CardSetSummary({ total }: CardSetSummaryProps) {
  return (
    <div className="text-lg font-medium">
      <span>
        {total === 0
          ? "Brak zestawów fiszek"
          : `${total} ${total === 1 ? "zestaw" : total < 5 ? "zestawy" : "zestawów"} fiszek`}
      </span>
    </div>
  );
}
