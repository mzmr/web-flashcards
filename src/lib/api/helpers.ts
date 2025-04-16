import type { ApiErrorResponse } from "./types";

/**
 * Przetwarza odpowiedź z API i zwraca dane lub rzuca błąd z odpowiednim komunikatem
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = (await response.json()) as ApiErrorResponse;
    throw new Error(errorData.error || "Wystąpił błąd podczas komunikacji z serwerem");
  }
  return response.json() as Promise<T>;
}

/**
 * Przekierowuje użytkownika do innej strony
 * @param path Ścieżka do przekierowania
 */
export function redirectTo(path: string): void {
  // Używamy window.location.href w efekcie, aby uniknąć błędów lintera
  if (typeof window !== "undefined") {
    setTimeout(() => {
      window.location.href = path;
    }, 0);
  }
}
