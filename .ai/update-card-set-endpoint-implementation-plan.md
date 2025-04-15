# API Endpoint Implementation Plan: Update Card Set

## 1. Przegląd punktu końcowego
Endpoint służy do aktualizacji nazwy istniejącego zestawu fiszek. Użytkownik wysyła żądanie z nową nazwą, a system aktualizuje rekord w bazie danych, zwracając zaktualizowany obiekt CardSetDTO.

## 2. Szczegóły żądania
- **Metoda HTTP:** PUT
- **Struktura URL:** /api/card-sets/{cardSetId}
- **Parametry:**
  - **Path Parameter:**
    - `cardSetId` - unikalny identyfikator zestawu fiszek
- **Request Body:**
  - Wymagane pole:
    - `name`: niepusty string o maksymalnej długości 100 znaków

## 3. Wykorzystywane typy
- **DTO:**
  - `CardSetDTO` (zawiera: `id`, `name`, `created_at`, `updated_at`)
- **Response DTO:**
  - `UpdateCardSetResponseDTO` (alias dla `CardSetDTO`)

## 4. Szczegóły odpowiedzi
- **200 OK:** Zwraca zaktualizowany obiekt CardSetDTO
  ```json
  {
    "id": "uuid",
    "name": "Updated Set Name",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **400 Bad Request:** Błędne dane wejściowe (np. brak pola name, przekroczenie limitu znaków)
- **404 Not Found:** Zestaw fiszek o podanym `cardSetId` nie istnieje
- **500 Internal Server Error:** Błąd po stronie serwera

## 5. Przepływ danych
1. Żądanie trafia do endpointa PUT `/api/card-sets/{cardSetId}`.
2. Walidator (np. z użyciem Zod) sprawdza, czy pole `name` jest obecne, niepuste i nie przekracza 100 znaków.
3. Pobierany jest aktualnie zalogowany użytkownik (za pomocą Supabase Auth i odczytu z kontekstu).
4. Następuje wyszukanie rekordu w tabeli `card_sets` na podstawie `cardSetId` i weryfikacja, czy zestaw należy do użytkownika.
5. Rekord jest aktualizowany w bazie: pole `name` oraz `updated_at` są modyfikowane.
6. Zaktualizowany rekord jest zwracany w odpowiedzi.

## 6. Względy bezpieczeństwa
- Wymagana autentykacja – endpoint powinien sprawdzać sesję użytkownika.
- Autoryzacja – upewnić się, że zestaw fiszek należy do aktualnie zalogowanego użytkownika.
- Walidacja danych przy użyciu Zod, aby uniknąć nieprawidłowych danych wejściowych.
- Ochrona przed SQL Injection dzięki użyciu mechanizmów Supabase (prepared queries i ORM).

## 7. Obsługa błędów
- **400 Bad Request:** Jeśli walidacja żądania nie powiedzie się (np. pole `name` jest puste lub za długie).
- **404 Not Found:** Jeśli nie znaleziono zestawu fiszek o podanym `cardSetId` lub zestaw nie należy do użytkownika.
- **500 Internal Server Error:** Wszelkie niespodziewane błędy (np. problemy z bazą danych) – błędy należy logować i monitorować.

## 8. Rozważania dotyczące wydajności
- Operacja aktualizacji jest lekką operacją na pojedynczym rekordzie, zatem nie powinna stanowić problemu wydajnościowego.

## 9. Etapy wdrożenia
1. **Implementacja walidacji:**
   - Stworzenie walidatora przy użyciu Zod, sprawdzającego obecność pola `name`, niepustość oraz maksymalną długość 100 znaków.
2. **Obsługa autoryzacji:**
   - Pobranie użytkownika z kontekstu (np. `context.locals.supabase`).
   - Weryfikacja, czy `cardSetId` należy do aktualnie zalogowanego użytkownika.
3. **Aktualizacja rekordu w bazie danych:**
   - Wyszukanie rekordu w tabeli `card_sets` na podstawie `cardSetId`.
   - Aktualizacja pola `name` oraz `updated_at`.
4. **Zwracanie odpowiedzi:**
   - Wysłanie odpowiedzi 200 OK z zaktualizowanym rekordem.
5. **Obsługa błędów:**
   - Zwracanie 400 w przypadku błędów walidacji.
   - Zwracanie 404, gdy rekord nie zostanie znaleziony.
   - Logowanie i zwracanie 500 przy niespodziewanych błędach.
6. **Testowanie:**
   - Implementacja testów jednostkowych i integracyjnych.
   - Aktualizacja dokumentacji API. 