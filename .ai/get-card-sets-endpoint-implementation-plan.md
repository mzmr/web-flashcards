# API Endpoint Implementation Plan: List Card Sets

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest pobranie spersonalizowanej, stronicowanej listy zestawów kart (card sets) dla uwierzytelnionego użytkownika. Endpoint udostępnia dane o zestawach kart, w tym ich identyfikator, nazwę oraz znaczniki czasu utworzenia i modyfikacji.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **URL**: `/api/card-sets`
- **Parametry zapytania**:
  - **Wymagane**: Brak
  - **Opcjonalne**:
    - `page` (typ: liczba całkowita, domyślnie 1) – numer strony
    - `limit` (typ: liczba całkowita, domyślnie 10) – liczba rekordów na stronę
    - `sort` (typ: string, opcjonalnie) – kryterium sortowania
- **Nagłówki**: Wymagany nagłówek autoryzacji, aby potwierdzić tożsamość użytkownika

## 3. Wykorzystywane typy
**DTOs i modele komend**:
- `CardSetDTO`: reprezentuje pojedynczy zestaw kart
  - `id`: string (UUID)
  - `name`: string
  - `created_at`: string (timestamp)
  - `updated_at`: string (timestamp)
- `Pagination`: informacje o stronicowaniu
  - `page`: number
  - `limit`: number
  - `total`: number
- `ListCardSetsResponseDTO`: zawiera listę `cardSets` i obiekt `pagination`

## 4. Szczegóły odpowiedzi
- **Struktura odpowiedzi (JSON)**:
  ```json
  {
    "cardSets": [
      {
        "id": "uuid",
        "name": "Set Name",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```
- **Kody statusu**:
  - 200 – udane pobranie danych
  - 400 – nieprawidłowe dane wejściowe
  - 401 – brak autoryzacji
  - 500 – błąd po stronie serwera

## 5. Przepływ danych
1. Klient wysyła żądanie GET na `/api/card-sets` z opcjonalnymi parametrami zapytania oraz nagłówkiem autoryzacji.
2. Middleware Astro weryfikuje token uwierzytelniający i umieszcza dane użytkownika w kontekście (np. `context.locals`).
3. Endpoint waliduje parametry zapytania przy użyciu Zod (lub innej biblioteki walidacyjnej) z przypisaniem wartości domyślnych (page = 1, limit = 10).
4. Logika biznesowa (service layer) wykonuje zapytanie do bazy danych (Supabase), filtrując rekordy w tabeli `card_sets` na podstawie `user_id` pobranego z kontekstu.
5. Wyliczana jest całkowita liczba rekordów spełniających kryteria do celów paginacji.
6. Endpoint zwraca JSON z listą zestawów kart i danymi paginacyjnymi.

## 6. Względy bezpieczeństwa
- **Autentykacja / autoryzacja**: Upewnij się, że żądanie jest wysyłane przez uwierzytelnionego użytkownika (sprawdzenie tokena, middleware, Supabase).
- **Walidacja danych**: Wszystkie dane wejściowe weryfikowane są za pomocą Zod, aby zabezpieczyć endpoint przed nieprawidłowymi lub złośliwymi danymi.
- **Ograniczenie dostępu**: Zapytanie do bazy danych wykonuje filtr na `user_id`, co zapewnia, że użytkownik otrzyma tylko swoje dane.

## 7. Obsługa błędów
- **401 Unauthorized**: W przypadku braku ważnego tokena lub nieautoryzowanego użytkownika.
- **400 Bad Request**: Gdy walidacja parametrów nie powiodła się (np. nieprawidłowy format `page` lub `limit`).
- **500 Internal Server Error**: W przypadku nieoczekiwanych błędów serwerowych.

## 8. Rozważania dotyczące wydajności
- **Optymalizacja zapytań**: Zapytanie do bazy danych powinno wykorzystywać limit i offset, aby poprawić wydajność przy dużych zbiorach danych.
- **Indeksowanie**: Upewnij się, że tabela `card_sets` ma odpowiednie indeksy (szczególnie na kolumnie `user_id`).

## 9. Etapy wdrożenia
1. **Utworzenie endpointu**: Utworzenie nowej funkcji dla metody GET w pliku `./src/pages/api/card-sets.ts`.
2. **Walidacja parametrów**: Implementacja walidacji zapytania przy użyciu Zod, z przypisaniem wartości domyślnych dla `page` i `limit`.
3. **Weryfikacja autoryzacji**: Implementacja middleware do sprawdzania autentykacji i wyciągania danych użytkownika z `context.locals`.
4. **Service Layer**: Rozszerzenie usługi `./src/lib/services/card-set.service.ts` odpowiedzialnej za wykonywanie zapytań do bazy danych Supabase.
5. **Implementacja logiki biznesowej**: Pobieranie danych z tabeli `card_sets` filtrowanych według `user_id`, obliczanie paginacji i tworzenie odpowiedzi JSON.
6. **Testowanie**: Testy jednostkowe i integracyjne endpointu, weryfikacja poprawności paginacji, walidacji i obsługi błędów.
7. **Logowanie błędów**: Implementacja mechanizmu logowania błędów.
8. **Dokumentacja**: Uzupełnienie dokumentacji API oraz zaktualizowanie dokumentacji projektu.
