# API Endpoint Implementation Plan: Create Card Set

## 1. Przegląd punktu końcowego
Endpoint umożliwia utworzenie nowego zestawu fiszek. Użytkownik, który jest uwierzytelniony, wysyła żądanie POST z nazwą zestawu, po czym system zapisuje rekord w bazie danych (tabela `card_sets`) i zwraca utworzony obiekt.

## 2. Szczegóły żądania
- **Metoda HTTP**: POST
- **URL**: `/api/card-sets`
- **Parametry**:
  - Wymagane:
    - `name`: string; niepusty, maksymalnie 100 znaków.
  - Opcjonalne: brak
- **Request Body**:
  ```json
  {
    "name": "My Flashcards"
  }
  ```

## 3. Wykorzystywane typy
- **DTO**:
  - `CardSetDTO`: zawiera pola `id`, `name`, `created_at`, `updated_at`.
  - `CreateCardSetResponseDTO`: identyczny jak `CardSetDTO`.
- **Command Model**:
  - `CreateCardSetCommand`: obiekt zawierający tylko pole `name` (wybór z `CardSetDTO`).

## 4. Szczegóły odpowiedzi
- **201 Created**: Zwraca stworzony obiekt `CardSetDTO`:
  ```json
  {
    "id": "uuid",
    "name": "My Flashcards",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **400 Bad Request**: W przypadku błędów walidacji (np. pusty `name` lub przekroczenie 100 znaków).
- **401 Unauthorized**: Gdy użytkownik nie jest uwierzytelniony.
- **500 Internal Server Error**: Błąd serwera, np. nieoczekiwany błąd przy operacjach bazodanowych.

## 5. Przepływ danych
1. Klient wysyła żądanie POST do `/api/card-sets` z payloadem zawierającym pole `name`.
2. Endpoint sprawdza, czy użytkownik jest uwierzytelniony (poprzez `supabase` w `context.locals`).
3. Walidacja danych wejściowych przy użyciu schematu zod: sprawdzenie, czy `name` jest niepustym stringiem o maksymalnej długości 100 znaków.
4. Przekazanie danych do warstwy serwisowej (np. `card-set.service`) odpowiedzialnej za komunikację z bazą danych.
5. Wstawienie nowego rekordu do tabeli `card_sets`, gdzie `user_id` pochodzi z kontekstu uwierzytelnienia.
6. Zwrócenie obiektu `CardSetDTO` z danymi nowo utworzonego zestawu.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Endpoint dostępny tylko dla zalogowanych użytkowników; weryfikacja przy użyciu `supabase` z `context.locals`.
- **Autoryzacja**: Upewnienie się, że użytkownik posiada odpowiednie uprawnienia do tworzenia zasobu.

## 7. Obsługa błędów
- **400 Bad Request**: Zwracane w przypadku nieprawidłowych danych wejściowych (np. brak lub niepoprawna wartość pola `name`).
- **401 Unauthorized**: Gdy użytkownik nie jest zalogowany.
- **500 Internal Server Error**: W razie wystąpienia nieoczekiwanych problemów (np. błąd komunikacji z bazą danych). Należy logować błędy, aby umożliwić ich późniejszą analizę.

## 8. Etapy wdrożenia
1. **Walidacja wejścia**: Zdefiniowanie schematu zod dla `CreateCardSetCommand` z zasadami: wartość obowiązkowa, niepusta, maksymalnie 100 znaków.
2. **Implementacja endpointu**: Utworzenie pliku `/src/pages/api/card-sets.ts` z logiką obsługi żądania POST, weryfikacją uwierzytelnienia oraz walidacją danych wejściowych.
3. **Warstwa serwisowa**: Utworzenie lub aktualizacja serwisu (np. `/src/lib/services/card-set.service.ts`), który będzie przeprowadzał operację INSERT do tabeli `card_sets` i obsługiwał logikę biznesową.
4. **Komunikacja z bazą**: Użycie klienta Supabase z `context.locals` do wykonania bezpiecznego zapytania INSERT.
5. **Testowanie**: Przeprowadzenie testów manualnych (np. przy użyciu Postmana) oraz jednostkowych do weryfikacji poprawności działania endpointu.