# API Endpoint Implementation Plan: Generate Flashcards (AI)

## 1. Przegląd punktu końcowego
- Endpoint służy do generowania tymczasowego zestawu fiszek na podstawie tekstu dostarczonego przez użytkownika.
- Jego celem jest przekazanie danych wejściowych do modelu AI, który zwróci podgląd wygenerowanych fiszek wraz z metadanymi dotyczącymi operacji generowania.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Ścieżka URL:** /api/generations
- **Parametry:**
  - **Wymagane:**
    - `input_text`: tekst o długości od 1000 do 10000 znaków
    - `card_set_id`: UUID identyfikujący zestaw fiszek
  - **Opcjonalne:** brak
- **Request Body (przykład):**
```json
{
  "input_text": "Text between 1000 and 10000 characters",
  "card_set_id": "UUID"
}
```

## 3. Wykorzystywane typy
- **Command Model:** `GenerateFlashcardsCommand` (z polami `input_text` i `card_set_id`)
- **DTO odpowiedzi:** `GenerateFlashcardsResponseDTO` (zawiera: `generation_id`, `input_text`, tablicę obiektów fiszek (każda z polami `front` i `back`), `created_at`, `updated_at`)
- **Dodatkowy typ:** `CardDTO` do reprezentacji pojedynczej fiszki

## 4. Przepływ danych
1. Użytkownik wysyła żądanie POST do `/api/generations` z danymi `input_text` oraz `card_set_id`.
2. Warstwa API wykonuje walidację danych wejściowych przy użyciu narzędzia takiego jak Zod:
   - Sprawdzenie, czy `input_text` mieści się w przedziale 1000-10000 znaków.
   - Weryfikacja, że `card_set_id` jest poprawnym UUID.
3. Sprawdzana jest autoryzacja, aby upewnić się, że użytkownik jest zalogowany oraz ma dostęp do podanego `card_set_id` (weryfikacja własności zasobu).
4. Logika generowania fiszek jest delegowana do warstwy serwisowej (np. `generation.service`), która:
   - Wywołuje usługę AI (np. przez Openrouter.ai) w celu wygenerowania fiszek.
   - Mierzy czas wykonania operacji oraz liczbę wygenerowanych fiszek.
5. Wyniki procesu generowania są zapisywane w bazie danych (tabela `generations`, ewentualnie `cards`).
6. W przypadku wystąpienia błędów podczas generowania, błąd jest rejestrowany w tabeli `generation_errors` wraz ze szczegółowymi informacjami.
7. Po poprawnym wykonaniu operacji zwracana jest odpowiedź z podsumowaniem wygenerowanych danych.

## 5. Względy bezpieczeństwa
- **Autentykacja i autoryzacja:**
  - Endpoint powinien być chroniony mechanizmami Supabase Auth, aby upewnić się, że tylko zalogowani użytkownicy mają dostęp do operacji.
  - Należy sprawdzić, czy `card_set_id` faktycznie należy do aktualnie zalogowanego użytkownika.
- **Walidacja danych:**
  - Weryfikacja długości tekstu i poprawności UUID.
  - Sanitizacja danych wejściowych dla ochrony przed atakami typu SQL Injection czy XSS.

## 6. Obsługa błędów
- **400 Bad Request:** Gdy dane wejściowe są nieprawidłowe (np. `input_text` nie mieści się w wymaganym przedziale, niepoprawny format UUID).
- **401 Unauthorized:** Gdy użytkownik nie jest zalogowany lub token autoryzacji wygasł.
- **404 Not Found:** Gdy `card_set_id` nie istnieje lub nie jest przypisany do aktualnego użytkownika.
- **500 Internal Server Error:** W przypadku nieoczekiwanych błędów serwerowych lub problemów wewnętrznych.
- Błędy operacyjne podczas generowania fiszek powinny być logowane w tabeli `generation_errors` wraz z odpowiednimi komunikatami i kodami błędów.

## 7. Rozważania dotyczące wydajności
- **Asynchroniczność:** Rozważenie asynchronicznego przetwarzania generowania fiszek, aby nie blokować odpowiedzi API.
- **Monitoring:** Implementacja narzędzi do monitorowania czasu wykonania i obciążenia endpointu.

## 8. Etapy wdrożenia
1. **Utworzenie endpointu API:**
   - Utworzenie pliku w `src/pages/api/generations.ts` obsługującego metodę POST.
2. **Walidacja danych wejściowych:**
   - Implementacja walidacji przy użyciu Zod.
3. **Autentykacja i autoryzacja:**
   - Zapewnienie, że tylko zalogowani użytkownicy mają dostęp, oraz weryfikacja własności `card_set_id`.
4. **Implementacja logiki serwisowej:**
   - Utworzenie lub modyfikacja serwisu w `generation.service.ts` do przetwarzania generowania fiszek.
   - Integracja z usługą AI (Openrouter.ai) w celu wygenerowania danych. Na początkowym etapie korzystamy z mocków zamiast korzystania z prawdziwego API.
5. **Interakcja z bazą danych:**
   - Zapis wygenerowanych danych do tabeli `generations` oraz opcjonalnie do tabeli `cards`.
6. **Rejestrowanie błędów:**
   - Implementacja mechanizmu zapisywania błędów do tabeli `generation_errors`.
7. **Zwracanie odpowiedzi:**
   - Odesłanie odpowiedzi 200 OK z wygenerowanymi danymi lub odpowiednich błędów (400, 401, 404, 500) w zależności od sytuacji.