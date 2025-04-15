# API Endpoint Implementation Plan: Delete Card Set

## 1. Przegląd punktu końcowego
Punkt końcowy DELETE `/api/card-sets/{cardSetId}` służy do usuwania zestawu fiszek przypisanego do danego użytkownika wraz z powiązanymi fiszkami. Operacja ta wykorzystuje mechanizm kaskadowego usuwania rekordów dzięki ograniczeniom narzuconym przez bazę danych.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE
- Struktura URL: `/api/card-sets/{cardSetId}`
- Parametry:
  - **cardSetId** (wymagany): UUID reprezentujący identyfikator zestawu fiszek
- Request Body: Brak

## 3. Wykorzystywane typy
- **DTO**: DeleteCardSetResponseDTO
  ```typescript
  export interface DeleteCardSetResponseDTO {
    message: string;
  }
  ```
- **Command/Modele**: Brak dodatkowych modeli, wystarczy walidacja parametru `cardSetId`.

## 4. Szczegóły odpowiedzi
- **200 OK**: Zestaw fiszek został usunięty pomyślnie.
  - Przykładowa odpowiedź:
    ```json
    {
      "message": "Card set deleted successfully"
    }
    ```
- **404 Not Found**: Zestaw fiszek o podanym `cardSetId` nie istnieje.
- **405 Method Not Allowed**: Użyto metody innej niż DELETE.
- **500 Internal Server Error**: Błąd po stronie serwera.

## 5. Przepływ danych
1. Klient wysyła żądanie DELETE na endpoint z parametrem `cardSetId`.
2. Middleware lub bezpośrednio endpoint weryfikuje autoryzację użytkownika (np. poprzez `context.locals.supabase`).
3. Walidacja parametru `cardSetId` (sprawdzenie formatu UUID za pomocą Zod lub innej biblioteki walidacyjnej).
4. Logika serwisowa:
   - Sprawdzenie, czy zestaw fiszek istnieje i należy do zalogowanego użytkownika.
   - Jeśli zestaw istnieje, wykonanie operacji usunięcia. Usunięcie rekordu w tabeli `card_sets` spowoduje kaskadowe usunięcie powiązanych fiszek dzięki relacji FOREIGN KEY z ustawionym ON DELETE CASCADE.
5. Zwrócenie odpowiedzi do klienta zgodnie z wynikiem operacji.

## 6. Względy bezpieczeństwa
- **Autentykacja**: Endpoint dostępny wyłącznie dla zalogowanych użytkowników. Należy weryfikować sesję lub token autoryzacyjny korzystając z `context.locals.supabase`.
- **Autoryzacja**: Sprawdzenie, czy zestaw fiszek należy do użytkownika wykonującego żądanie.
- **Walidacja danych**: Sprawdzenie formatu UUID dla `cardSetId`, aby zapobiec nieprawidłowym wejściom.
- **Ochrona przed SQL Injection**: Użycie wbudowanych mechanizmów Supabase oraz przygotowanych zapytań.

## 7. Obsługa błędów
- **404 Not Found**: Gdy nie znaleziono zestawu fiszek o podanym `cardSetId`.
- **405 Method Not Allowed**: W przypadku użycia nieobsługiwanej metody HTTP.
- **500 Internal Server Error**: W przypadku niespodziewanych błędów po stronie serwera.
- Odpowiedzi powinny zawierać czytelne komunikaty błędów dla klienta.

## 8. Rozważania dotyczące wydajności
- Wykorzystanie mechanizmu kaskadowego usuwania rekordów w bazie danych redukuje liczbę zapytań.
- Użycie indeksów na kluczach głównych oraz obcych (np. `cardSetId`) zapewnia szybkie wyszukiwanie rekordów.

## 9. Etapy wdrożenia
1. Utworzenie pliku endpointa: `/src/pages/api/card-sets/[cardSetId].ts`.
2. Implementacja walidacji metody HTTP – akceptacja tylko metody DELETE, w przeciwnym razie zwracanie 405.
3. Weryfikacja autoryzacji użytkownika poprzez `context.locals.supabase`.
4. Walidacja parametru `cardSetId` jako UUID (z użyciem Zod lub innej biblioteki walidacyjnej).
5. Implementacja logiki serwisowej:
   - Sprawdzenie istnienia zestawu fiszek i przynależności do użytkownika.
   - Wykonanie operacji usunięcia z bazą danych, umożliwiającej kaskadowe usunięcie powiązanych rekordów.
6. Obsługa potencjalnych błędów: zwracanie odpowiednich kodów statusu (404, 500) oraz komunikatów.
7. Testy jednostkowe oraz e2e, aby upewnić się, że endpoint działa poprawnie.
8. Przegląd kodu przez zespół developerski i wdrożenie na środowisku testowym przed produkcją. 