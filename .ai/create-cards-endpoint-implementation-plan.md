Plan wdrożenia endpointu REST API: Create Cards

## 1. Przegląd punktu końcowego
Endpoint umożliwia dodanie jednej lub wielu fiszek do określonego zestawu fiszek (card set). Fiszki mogą pochodzić z różnych źródeł: ai_generated, ai_edited lub user_created. Dla fiszek typu ai_generated i ai_edited wymagane jest podanie generation_id.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /api/card-sets/{cardSetId}/cards
- Parametry:
  - Path Parameter: cardSetId (wymagany)
  - Body (JSON):
    {
      "cards": [
        {
          "front": "Front text (max 300 znaków, wymagany)",
          "back": "Back text (max 300 znaków, wymagany)",
          "source": "ai_generated | ai_edited | user_created (wymagany)",
          "generation_id": "UUID (wymagany dla ai_generated i ai_edited)"
        }
      ]
    }
- Walidacje:
  - "front" oraz "back" muszą być niepuste i nie dłuższe niż 300 znaków.
  - "source" musi być jedną z wartości: ai_generated, ai_edited, user_created.
  - Dla wartości ai_generated i ai_edited, generation_id musi być poprawnym UUID.

## 3. Wykorzystywane typy
- DTO:
  - CardDTO
  - CardSetDTO / CardSetDetailDTO
- Command Models:
  - CreateCardsCommand (zawiera tablicę CardCreateInput)
  - CardCreateInput, który rozróżnia:
      - AICardCreateInput (dla ai_generated i ai_edited)
      - UserCardCreateInput (dla user_created)
- Response:
  - CreateCardsResponseDTO, zawierający listę utworzonych CardDTO

## 4. Szczegóły odpowiedzi
- Status 201 Created: Zwraca utworzone fiszki w strukturze:
  {
    "cards": [
      {
        "id": "UUID",
        "front": "Front text",
        "back": "Back text",
        "source": "ai_generated",
        "generation_id": "UUID",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ]
  }
- Status 400 Bad Request: Zwraca błędy walidacji (np. przekroczenie 300 znaków, brak generation_id dla AI fiszek, nieprawidłowa wartość source).

## 5. Przepływ danych
1. Żądanie z danymi trafia do endpointu.
2. Autoryzacja: Weryfikacja tokena oraz sprawdzenie, czy użytkownik jest właścicielem wskazanego cardSet.
3. Walidacja danych wejściowych przy użyciu Zod, zgodnie z podanymi ograniczeniami.
4. Przekazanie zwalidowanych danych do warstwy serwisowej odpowiedzialnej za logikę biznesową.
5. W warstwie serwisowej wykonanie operacji insert do tabeli `cards` przy użyciu SupabaseClient, z możliwością batch insert dla wielu fiszek.
6. Aktualizacja pól `created_at` i `updated_at` zgodnie z regułami bazy danych.
7. Zwrócenie odpowiedzi 201 Created z utworzonymi rekordami.

## 6. Względy bezpieczeństwa
- Autoryzacja: Wykorzystanie mechanizmu Supabase Auth do weryfikacji tożsamości użytkownika oraz sprawdzenia uprawnień do dostępu do danego cardSet.
- Walidacja danych wejściowych: Użycie Zod do walidacji struktury i wartości danych.
- Sanitizacja danych: Sprawdzenie tekstu wejściowego i formatu UUID, aby zapobiec atakom (np. SQL Injection).

## 7. Obsługa błędów
- 400 Bad Request: Błędy walidacji danych wejściowych.
- 401 Unauthorized: Brak lub niepoprawny token uwierzytelniający.
- 404 Not Found: Card set o podanym ID nie istnieje lub nie należy do użytkownika.
- 500 Internal Server Error: Błędy po stronie serwera, np. problemy z bazą danych.

## 8. Rozważenia dotyczące wydajności
- Wykorzystanie batch insertu dla wielu fiszek w jednym zapytaniu, aby zredukować liczbę zapytań do bazy danych.
- Optymalizacja zapytań do bazy danych poprzez indeksowanie pól takich jak card_set_id.
- Minimalizacja obciążenia walidacją przez użycie bibliotek takich jak Zod.

## 9. Etapy wdrożenia
1. Utworzenie nowego endpointu w lokalizacji: `src/pages/api/card-sets/[cardSetId]/cards.ts`.
2. Implementacja walidacji żądania przy użyciu Zod, definiując schemat walidacyjny odpowiadający specyfikacji.
3. Dodanie middleware odpowiedzialnego za autoryzację, weryfikującego token i przynależność cardSet do użytkownika.
4. Utworzenie (lub rozszerzenie istniejącego) serwisu w `src/lib/services/cards.service.ts`, który będzie zawierał logikę biznesową dodawania fiszek.
5. Implementacja funkcji do insercji danych do bazy przy użyciu SupabaseClient.
6. Zapewnienie poprawnej obsługi błędów, zgodnie z przyjętymi kodami statusu HTTP, oraz logowanie błędów.
7. Testowanie endpointu pod kątem różnych scenariuszy: poprawne dane, błędne dane, próba dostępu nieautoryzowanego, brak wskazanego cardSet itp.
