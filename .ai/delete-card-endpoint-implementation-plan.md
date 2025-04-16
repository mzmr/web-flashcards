# API Endpoint Implementation Plan: Delete Card Endpoint

## 1. Przegląd punktu końcowego
Endpoint służy do usuwania fiszki (card) z określonego zestawu fiszek (card set). Operacja ta powinna być dostępna tylko dla autoryzowanych użytkowników, którzy są właścicielami danego zestawu.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE
- Struktura URL: `/api/card-sets/{cardSetId}/cards/{cardId}`
- Parametry:
  - Wymagane:
    - `cardSetId`: UUID wskazujący na zestaw fiszek.
    - `cardId`: UUID wskazujący na fiszkę, która ma zostać usunięta.
  - Opcjonalne: Brak
- Body: Brak

## 3. Wykorzystywane typy
- `DeleteCardResponseDTO`: { message: string }
- Inne typy pomocnicze z `src/types.ts`
- Parametry ścieżki: UUID dla `cardSetId` oraz `cardId`

## 4. Szczegóły odpowiedzi
- 200 OK: Zwracany JSON:
  ```json
  {
    "message": "Card deleted successfully"
  }
  ```
- 404 Not Found: Jeśli fiszka nie istnieje lub nie pasuje do podanego zestawu.
- Inne kody: 
  - 400 dla niepoprawnych danych wejściowych.
  - 401 dla nieautoryzowanego dostępu.
  - 500 dla błędów po stronie serwera.

## 5. Przepływ danych
1. Uwierzytelnienie użytkownika: Pobranie sesji z kontekstu Supabase.
2. Walidacja parametrów: Sprawdzenie, czy `cardSetId` oraz `cardId` są poprawnymi UUID.
3. Weryfikacja właściciela: Sprawdzenie, czy dany `cardSet` faktycznie należy do zalogowanego użytkownika.
4. Weryfikacja fiszki: Sprawdzenie czy fiszka istnieje w danym zestawie.
5. Usunięcie rekordu: Wykonanie operacji usunięcia rekordu w bazie danych oraz ewentualna aktualizacja znaczników czasowych.
6. Zwrot odpowiedzi: W przypadku powodzenia, zwrócenie komunikatu o udanym usunięciu.

## 6. Względy bezpieczeństwa
- Uwierzytelnienie: Endpoint dostępny tylko dla zalogowanych użytkowników.
- Autoryzacja: Weryfikacja, czy użytkownik jest właścicielem zestawu fiszek.
- Walidacja danych wejściowych: Sprawdzenie, czy parametry `cardSetId` i `cardId` są poprawnymi UUID, co zapobiega atakom typu SQL Injection.
- Użycie parametrów zamiast bezpośredniego wstrzykiwania danych do zapytań SQL.

## 7. Obsługa błędów
- 404 Not Found: Jeśli fiszka lub zestaw fiszek nie zostanie znaleziony.
- 400 Bad Request: Dla niepoprawnych danych wejściowych (np. błędny format UUID).
- 401 Unauthorized: Jeżeli użytkownik nie posiada uprawnień do wykonania operacji.
- 500 Internal Server Error: W przypadku nieoczekiwanych błędów serwera.
- Rejestrowanie błędów: Logowanie błędów.

## 8. Rozważania dotyczące wydajności
- Optymalizacja zapytań do bazy danych poprzez korzystanie z indeksów na kolumnach `id` i `card_set_id`.
- Minimalizacja liczby zapytań: Weryfikacja istnienia zestawu fiszek oraz fiszki powinna być zrealizowana w jednym złożonym zapytaniu, jeśli to możliwe.

## 9. Etapy wdrożenia
1. Utworzenie nowego endpointu w ścieżce `/src/pages/api/card-sets/[cardSetId]/cards/[cardId].ts`.
2. Implementacja middleware uwierzytelniającego użytkownika oraz pobranie instancji `supabase` z `context.locals`.
3. Walidacja parametrów wejściowych (UUID) dla `cardSetId` i `cardId` z użyciem odpowiednich bibliotek (np. Zod).
4. Weryfikacja, czy użytkownik jest właścicielem zestawu fiszek poprzez zapytanie do tabeli `card_sets`.
5. Weryfikacja, czy fiszka istnieje w danym zestawie poprzez zapytanie do tabeli `cards`.
6. Wykonanie operacji usunięcia fiszki.
7. Zwrot odpowiedzi 200 w przypadku sukcesu lub odpowiedniego kodu błędu (404, 400, 401, 500) w innych przypadkach.
8. Dodanie logiki rejestrowania błędów w przypadku niepowodzeń operacji.
9. Przeprowadzenie testów jednostkowych i integracyjnych endpointu. 