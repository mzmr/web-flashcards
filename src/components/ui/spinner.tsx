import { cn } from "@/lib/utils";

type SpinnerProps = React.HTMLAttributes<HTMLDivElement>;

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Ładowanie"
      className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      {...props}
    />
  );
}
