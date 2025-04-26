interface CardSetSummaryProps {
  total: number;
}

export function CardSetSummary({ total }: CardSetSummaryProps) {
  const summary =
    total === 0
      ? "Brak zestawów fiszek"
      : `${total} ${total === 1 ? "zestaw" : total < 5 ? "zestawy" : "zestawów"} fiszek`;

  return (
    <div className="text-lg font-medium" role="status" aria-live="polite">
      <span aria-label={`Liczba zestawów fiszek: ${summary}`}>{summary}</span>
    </div>
  );
}
