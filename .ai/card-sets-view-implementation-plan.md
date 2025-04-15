# Plan implementacji widoku Widok listy zestawów fiszek

## 1. Przegląd
Widok ma na celu wyświetlenie wszystkich zestawów fiszek użytkownika oraz umożliwienie dodania nowego zestawu. Na górze widoku prezentowany jest licznik zestawów, a poniżej lista posortowana malejąco według daty ostatniej modyfikacji. Widok musi zapewniać prostą nawigację i spełniać wymogi dostępności.

## 2. Routing widoku
Widok powinien być dostępny pod adresem `/card-sets`.

## 3. Struktura komponentów
- **CardSetsPage** – główny kontener widoku odpowiedzialny za pobranie danych, zarządzanie stanem oraz integrację API.
- **CardSetSummary** – komponent prezentujący podsumowanie, np. łączną liczbę zestawów fiszek.
- **CardSetList** – komponent renderujący listę zestawów; iteruje po danych i wykorzystuje komponenty potomne do wyświetlenia szczegółów.
- **CardSetItem** – komponent prezentujący pojedynczy zestaw fiszek (nazwa, data modyfikacji) oraz umożliwiający wybór zestawu.
- **NewCardSetButton** – przycisk otwierający modal dodania nowego zestawu.
- **NewCardSetModal** – modal zawierający pole tekstowe do wpisania nazwy nowego zestawu oraz dwa przyciski: "Dodaj" i "Anuluj".

## 4. Szczegóły komponentów
### CardSetsPage
- **Opis**: Główny kontener widoku, odpowiada za inicjalizację pobierania danych z API, zarządzanie stanem listy zestawów oraz kontrolę modalu dodawania.
- **Główne elementy**: 
  - Inicjalizacja pobierania danych (GET `/api/card-sets`), np. przy użyciu hooka lub efektu ubocznego.
  - Obsługa stanu listy zestawów i flagi widoczności modalu.
- **Obsługiwane interakcje**: 
  - Po załadowaniu strony pobranie danych.
  - Aktualizacja listy po dodaniu nowego zestawu.
- **Typy**: Wykorzystuje `ListCardSetsResponseDTO`, czyli `CardSetDTO` oraz strukturę paginacji z API (`Pagination`).
- **Propsy**: Brak – komponent główny.

### CardSetSummary
- **Opis**: Wyświetla łączną liczbę dostępnych zestawów fiszek.
- **Główne elementy**: Element tekstowy pokazujący liczbę (np. "10 zestawów").
- **Obsługiwane interakcje**: Brak bezpośredniej interakcji użytkownika.
- **Typy**: Przyjmuje listę zestawów lub liczbę jako prop.
- **Propsy**: 
  - `total: number` – całkowita liczba zestawów.

### CardSetList
- **Opis**: Renderuje listę zestawów fiszek.
- **Główne elementy**: Pętla mapująca po danych i wywołująca komponent `CardSetItem` dla każdego zestawu.
- **Obsługiwane interakcje**: Kliknięcie na element listy umożliwiające przejście do szczegółów zestawu.
- **Typy**: Oczekuje tablicy obiektów typu `CardSetDTO`.
- **Propsy**: 
  - `cardSets: CardSetDTO[]`

### CardSetItem
- **Opis**: Prezentacja pojedynczego zestawu fiszek.
- **Główne elementy**: Wyświetlenie nazwy oraz daty ostatniej modyfikacji.
- **Obsługiwane interakcje**: Kliknięcie umożliwiające wybór i przejście do szczegółów zestawu.
- **Typy**: Bazuje na `CardSetDTO`.
- **Propsy**: 
  - `cardSet: CardSetDTO`

### NewCardSetButton
- **Opis**: Przycisk, którego kliknięcie otwiera modal umożliwiający dodanie nowego zestawu.
- **Główne elementy**: Prosty przycisk z etykietą (np. "Nowy zestaw").
- **Obsługiwane interakcje**: Kliknięcie wywołujące akcję otwarcia modalu.
- **Typy**: Brak specjalnych typów.
- **Propsy**: 
  - `onClick: () => void`

### NewCardSetModal
- **Opis**: Modal umożliwiający dodanie nowego zestawu fiszek poprzez wpisanie nazwy.
- **Główne elementy**: 
  - Pole tekstowe do wprowadzenia nazwy zestawu.
  - Przyciski: "Dodaj" (potwierdzenie) oraz "Anuluj" (zamknięcie modalu).
- **Obsługiwane interakcje**: 
  - Walidacja pola (nazwa niepusta, długość ≤ 100 znaków).
  - Wywołanie API POST `/api/card-sets` na kliknięcie "Dodaj".
  - Informowanie użytkownika o błędach walidacji lub błędach API.
- **Typy**: Wykorzystuje typ `CreateCardSetCommand` przy wywołaniu API.
- **Propsy**: 
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onCardSetAdded: (cardSet: CardSetDTO) => void`

## 5. Typy
- **CardSetDTO**: 
  - `id: string`
  - `name: string`
  - `created_at: string`
  - `updated_at: string`
- **CreateCardSetCommand**: 
  - `name: string` (walidacja: niepuste, max 100 znaków)
- **Pagination**: 
  - `page: number`, `limit: number`, `total: number`
- W razie potrzeby można zdefiniować dodatkowy ViewModel dla modalu lub komponentu listy, jeżeli zajdzie potrzeba adaptacji danych z API do widoku.

## 6. Zarządzanie stanem
- W głównym komponencie (`CardSetsPage`) użyjemy hooka `useState` do przechowywania:
  - Listy zestawów fiszek
  - Flagę otwarcia/zamknięcia modalu
  - Ewentualne komunikaty błędów
  - Flagę `isLoading` do reprezentowania stanu ładowania danych
  - Użyjemy komponentu `SkeletonLoader` z shadcn/ui, który będzie wyświetlany podczas pobierania lub aktualizacji danych

## 7. Integracja API
- **GET /api/card-sets**:
  - Wywołanie API przy inicjalizacji widoku.
  - Podczas pobierania danych, wyświetlany jest komponent `SkeletonLoader`.
  - Użycie query parametrów (`page`, `limit`, `sort`) z domyślnymi wartościami, przy czym sortowanie musi zapewniać malejącą kolejność według `updated_at`.
  - Dane o stronie, limit i łączna liczba zestawów pozwalają na implementację mechanizmu paginacji.
- **POST /api/card-sets**:
  - Wywołanie API przy dodaniu nowego zestawu z walidacją nazwy.
  - Walidacja po stronie klienta przed wysłaniem żądania (nazwa – niepusty, ≤100 znaków).
  - Aktualizacja listy zestawów po udanej operacji.

## 8. Interakcje użytkownika
- Po wejściu na stronę następuje automatyczne pobranie i wyświetlenie listy zestawów.
- Kliknięcie przycisku "Nowy zestaw" otwiera modal.
- W modalu: wpisanie nazwy, kliknięcie "Dodaj" powoduje walidację i wywołanie API, a następnie aktualizację widoku.
- Kliknięcie "Anuluj" zamyka modal bez żadnych zmian.
- Kliknięcie pojedynczego elementu listy umożliwia przejście do szczegółów wybranego zestawu (ewentualna nawigacja lub przekazanie identyfikatora zestawu).
+ Jeśli dane są w trakcie pobierania lub aktualizacji, użytkownik widzi komponent `SkeletonLoader` zamiast pustej listy.

## 9. Warunki i walidacja
- Pole tekstowe w modalu musi zawierać przynajmniej 1 znak i nie przekraczać 100 znaków.
- Odpowiedzi API muszą być walidowane – w przypadku błędów wyświetlić zostanie odpowiedni komunikat.
- Mechanizm odświeżania danych (re-fetch) po dodaniu nowego zestawu.

## 10. Obsługa błędów
- W przypadku niepowodzenia pobierania danych z API, wyświetlić komunikat o błędzie oraz opcję ponowienia próby.
- W modalu, jeśli walidacja nie przejdzie lub wystąpi błąd przy tworzeniu zestawu, wyświetlić odpowiedni komunikat (np. "Nazwa zestawu jest wymagana" lub "Błąd serwera").

## 11. Kroki implementacji
1. Utworzyć nową stronę w folderze `src/pages` pod nazwą `card-sets.astro` i zaimportować główny komponent `CardSetsPage`.
2. Zaimplementować komponent `CardSetsPage` jako kontener widoku z logiką pobierania danych (GET `/api/card-sets`), zarządzaniem stanem oraz obsługą modalu.
3. Utworzyć komponenty: `CardSetSummary`, `CardSetList`, `CardSetItem`, `NewCardSetButton` oraz `NewCardSetModal` w folderze `src/components` lub `src/components/ui` w zależności od ich charakteru.
4. Zaimplementować walidację w komponencie `NewCardSetModal` i integrację wywołania POST `/api/card-sets`.
5. Zintegrować wszystkie komponenty w `CardSetsPage`, zapewniając przekazywanie niezbędnych danych i funkcji pomiędzy komponentami.
6. Testować interakcje, sprawdzając walidację, aktualizację listy zestawów oraz obsługę błędów.
7. Zastosować style przy użyciu Tailwind oraz komponenty na bazie Shadcn/ui według standardów projektu.
