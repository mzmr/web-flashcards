# API Endpoint Implementation Plan: Get Card Set Details

## 1. Przegląd punktu końcowego
Endpoint umożliwia pobranie szczegółowych informacji o zestawie fiszek na podstawie jego unikalnego identyfikatora. Oprócz danych zestawu, zwracane są również powiązane fiszki.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: /api/card-sets/{cardSetId}
- **Parametry ścieżki**:
  - `cardSetId` (wymagany): Unikalny identyfikator zestawu fiszek (UUID).
- **Request Body**: Brak

## 3. Wykorzystywane typy
- `CardSetDTO` oraz `CardSetDetailDTO` (rozszerzony o listę fiszek)
- `CardDTO` dla pojedynczych fiszek

## 4. Szczegóły odpowiedzi
- **200 OK**: Zwraca obiekt `CardSetDetailDTO` zawierający:
  - `id`: UUID
  - `name`: Nazwa zestawu
  - `created_at`: Data utworzenia
  - `updated_at`: Data modyfikacji
  - `cards`: Lista obiektów `CardDTO`, gdzie każdy obiekt zawiera:
    - `id`, `front`, `back`, `source`, `generation_id`, `created_at`, `updated_at`
- **404 Not Found**: Zestaw fiszek nie istnieje
- **400 Bad Request**: Błędny format `cardSetId`
- **500 Internal Server Error**: Nieoczekiwany błąd serwera

## 5. Przepływ danych
1. Odbiór żądania GET na endpoint `/api/card-sets/{cardSetId}`.
2. Walidacja parametru `cardSetId` (sprawdzenie poprawności formatu UUID).
3. Użycie klienta Supabase (poprzez `context.locals.supabase`) do:
   - Pobrania rekordu z tabeli `card_sets` na podstawie `cardSetId`.
   - Pobrania powiązanych fiszek z tabeli `cards` filtrowanych przez `card_set_id`.
4. Mapowanie danych z bazy na strukturę `CardSetDetailDTO`.
5. Zwrócenie odpowiedzi 200 OK lub odpowiedniego błędu (np. 404 Not Found, jeśli zestaw nie został znaleziony).

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Endpoint powinien być zabezpieczony (np. przez middleware autoryzacji), sprawdzając, czy użytkownik ma dostęp do danego zasobu.
- **Walidacja wejścia**: Dokładne sprawdzenie formatu `cardSetId` przy użyciu narzędzi walidujących (np. Zod).
- **Ochrona przed SQL Injection**: Wykorzystanie parametrów w zapytaniach do bazy danych, unikanie budowania zapytań w sposób dynamiczny.

## 7. Obsługa błędów
- **404 Not Found**: Zwracane, gdy żaden rekord nie odpowiada podanemu `cardSetId`.
- **400 Bad Request**: Zwracane, gdy `cardSetId` nie spełnia wymogów formatu UUID.
- **500 Internal Server Error**: Zwracane w przypadku nieoczekiwanych błędów serwera. Logowanie błędów.

## 8. Rozważania dotyczące wydajności
- **Optymalizacja zapytań**: Upewnienie się, że kolumny `id` oraz `card_set_id` są odpowiednio indeksowane.

## 9. Etapy wdrożenia
1. **Utworzenie endpointa API**: Dodanie pliku (np. `src/pages/api/card-sets/[cardSetId].ts`) obsługującego żądania GET.
2. **Walidacja `cardSetId`**: Implementacja walidacji wejścia (np. przy użyciu Zod), aby upewnić się, że parametr ma format UUID.
3. **Implementacja serwisu**: Utworzenie logiki w serwisie (np. `src/lib/services/card-set.service.ts`), która:
   - Pobiera z bazy danych rekord z tabeli `card_sets`.
   - Pobiera powiązane fiszki z tabeli `cards`.
   - Mapuje dane do obiektu `CardSetDetailDTO`.
4. **Integracja z Supabase**: Użycie klienta Supabase (przekazywanego przez `context.locals.supabase`) do wykonania zapytań do bazy danych.
5. **Obsługa błędów**: Implementacja mechanizmów wychwytywania wyjątków i zwracania odpowiednich kodów statusu (400, 404, 500) oraz logowanie błędów.
6. **Testy**: Przygotowanie testów jednostkowych i integracyjnych dla nowego endpointa, aby upewnić się, że działa zgodnie z oczekiwaniami.
7. **Dokumentacja**: Aktualizacja dokumentacji API.
