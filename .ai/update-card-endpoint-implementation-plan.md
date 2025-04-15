# API Endpoint Implementation Plan: Update Card

## 1. Przegląd punktu końcowego
Punkt końcowy służy do aktualizacji istniejącej fiszki. Umożliwia użytkownikowi modyfikację treści fiszki (przód i tył) przechowywanej w określonym zestawie fiszek. Endpoint jest częścią systemu zarządzania fiszkami i powinien być zabezpieczony uwierzytelnianiem oraz autoryzacją.

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- Struktura URL: `/api/card-sets/{cardSetId}/cards/{cardId}`
- Parametry URL:
  - `cardSetId`: identyfikator zestawu fiszek (wymagany)
  - `cardId`: identyfikator fiszki (wymagany)
- Request Body:
  ```json
  {
      "front": "Updated front text",
      "back": "Updated back text"
  }
  ```
- Walidacje:
  - `front`: wymagany, niepusty, maksymalnie 300 znaków
  - `back`: wymagany, niepusty, maksymalnie 300 znaków

## 3. Wykorzystywane typy
- `UpdateCardCommand`: DTO do otrzymania danych wejściowych (pola: `front`, `back`).
- `UpdateCardResponseDTO`: DTO zawierający szczegółowe dane fiszki (pola: `id`, `front`, `back`, `source`, `generation_id`, `created_at`, `updated_at`).
- `CardDTO`: reprezentacja obiektu fiszki.

## 4. Szczegóły odpowiedzi
- **200 OK**: zwraca zaktualizowaną fiszkę:
  ```json
  {
      "id": "uuid",
      "front": "Updated front text",
      "back": "Updated back text",
      "source": "ai_generated",
      "generation_id": "uuid",
      "created_at": "timestamp",
      "updated_at": "timestamp"
  }
  ```
- **400 Bad Request**: błędy walidacji danych wejściowych.
- **404 Not Found**: fiszka lub zestaw fiszek nie istnieje.
- **500 Internal Server Error**: błędy serwerowe.

## 5. Przepływ danych
1. Klient wysyła żądanie PUT na `/api/card-sets/{cardSetId}/cards/{cardId}` z danymi w formacie JSON.
2. Middleware i mechanizmy autoryzacji w Astro weryfikują autentyczność użytkownika.
3. Endpoint wyciąga parametr `cardSetId` oraz `cardId` z URL.
4. Walidacja danych wejściowych odbywa się przy użyciu Zod, sprawdzając obecność oraz długość pól `front` i `back`.
5. Funkcja serwisowa (w `src/lib/services/cards.service.ts`) sprawdza:
   - Istnienie zestawu fiszek dla zadanego `cardSetId` oraz czy należy on do użytkownika.
   - Istnienie fiszki o zadanym `cardId` w danym zestawie.
6. Aktualizacja rekordu w tabeli `cards` (aktualizacja pól `front`, `back`).
7. Zaktualizowane dane są zwracane jako odpowiedź.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie i autoryzacja: Endpoint musi weryfikować, czy użytkownik ma prawo operować na danym zestawie i karcie.
- Walidacja danych przy użyciu Zod.
- Ograniczenie długości pól aby zapobiec nadużyciom.
- Zabezpieczenie przed wstrzyknięciami SQL poprzez stosowanie zapytań parametryzowanych.

## 7. Obsługa błędów
- **400 Bad Request**: w przypadku nieprawidłowych danych wejściowych lub błędów walidacji.
- **404 Not Found**: gdy zestaw fiszek lub fiszka nie istnieje.
- **500 Internal Server Error**: dla błędów systemowych lub niespodziewanych wyjątków.

## 8. Wydajność
- Indeksacja kolumn `id`, `card_set_id` dla szybkich wyszukiwań.
- Minimalizacja liczby zapytań przez łączenie operacji w ramach jednej transakcji, jeśli to możliwe.

## 9. Etapy implementacji
1. Utworzenie pliku endpointu w odpowiednim folderze, np. `src/pages/api/card-sets/[cardSetId]/cards/[cardId].ts`.
2. Implementacja middleware do uwierzytelniania i autoryzacji użytkownika.
3. Uwzględnienie walidacji danych wejściowych przy użyciu Zod (zgodnie z wymaganiami).
4. Utworzenie funkcji serwisowej w `src/lib/services/cards.service.ts`, która wykonuje logikę aktualizacji fiszki.
5. Wykonanie zapytania do bazy danych w celu aktualizacji rekordu w tabeli `cards`.
6. Implementacja mechanizmu obsługi błędów, aby zwrócić odpowiednie kody statusu:
   - 400 dla błędów walidacyjnych,
   - 404 gdy zasób nie istnieje,
   - 500 dla niespodziewanych wyjątków.
7. Testy jednostkowe i integracyjne endpointu.
8. Aktualizacja dokumentacji API, aby uwzględnić nowy endpoint. 