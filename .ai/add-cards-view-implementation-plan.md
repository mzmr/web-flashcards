# Plan implementacji widoku dodawania fiszek

## 1. Przegląd
Widok dodawania fiszek umożliwia użytkownikom tworzenie nowych fiszek w wybranym zestawie na dwa sposoby: poprzez generowanie AI na podstawie wprowadzonego tekstu lub ręczne dodawanie pojedynczych fiszek. Wszystkie fiszki, niezależnie od sposobu ich utworzenia, trafiają na wspólną listę, gdzie można je edytować i usuwać przed ostatecznym zatwierdzeniem.

## 2. Routing widoku
- Ścieżka: `/card-sets/:id/add-cards`
- Parametry URL:
  * `id`: UUID zestawu fiszek

## 3. Struktura komponentów
```
CardSetPage (istniejący)
└── AddCardsButton (nowy)

AddCardsPage
├── AIGenerationForm
│   └── LoadingSpinner
├── EditCardDialog (istniejący, reużyty)
└── TemporaryCardList (nowy)
    └── TemporaryCardItem (nowy)
```

## 4. Szczegóły komponentów

### AddCardsButton
- Opis komponentu: Przycisk w widoku zestawu, przekierowujący do widoku dodawania fiszek
- Główne elementy:
  * Przycisk "Dodaj fiszki"
- Obsługiwane interakcje:
  * Przekierowanie do `/card-sets/:id/add-cards`
- Propsy:
  * `cardSetId: string`

### AddCardsPage
- Opis komponentu: Główny komponent widoku, zarządzający stanem i koordynujący interakcje między komponentami
- Główne elementy:
  * Nagłówek z przyciskiem powrotu
  * AIGenerationForm
  * Przycisk "Dodaj ręcznie" otwierający EditCardDialog
  * TemporaryCardList z wygenerowanymi/utworzonymi fiszkami
  * Przycisk "Zatwierdź wszystkie"
- Obsługiwane interakcje:
  * Nawigacja powrotna
  * Otwieranie/zamykanie modalu
  * Zatwierdzanie wszystkich fiszek
- Typy:
  * `TemporaryCard[]`
- Propsy: brak (komponent routingu)

### AIGenerationForm
- Opis komponentu: Formularz do wprowadzania tekstu i generowania fiszek przez AI
- Główne elementy:
  * Textarea do wprowadzania tekstu
  * Przycisk "Generuj"
  * LoadingSpinner podczas generowania
  * Komunikaty błędów
- Obsługiwane interakcje:
  * Wprowadzanie tekstu
  * Rozpoczęcie generowania
- Obsługiwana walidacja:
  * Długość tekstu: 1000-10000 znaków
- Typy:
  * `GenerateFlashcardsResponseDTO`
- Propsy:
  * `onGenerate: (response: GenerateFlashcardsResponseDTO) => void`

### EditCardDialog (reużyty)
- Opis komponentu: Modal do ręcznego dodawania i edycji fiszek
- Główne elementy:
  * Dwa pola tekstowe (przód i tył)
  * Przyciski akcji
  * Komunikaty błędów
- Obsługiwane interakcje:
  * Wprowadzanie tekstu
  * Zatwierdzanie/anulowanie
- Obsługiwana walidacja:
  * Długość tekstu: max 300 znaków per pole
  * Wymagane oba pola
- Typy:
  * `CardDTO`
  * `UpdateCardCommand`
- Propsy:
  * `card?: CardDTO` (opcjonalne dla trybu dodawania)
  * `isOpen: boolean`
  * `onOpenChange: (open: boolean) => void`
  * `onUpdate: (data: UpdateCardCommand) => Promise<void>`

### TemporaryCardList
- Opis komponentu: Lista wyświetlająca wszystkie tymczasowe fiszki przed zatwierdzeniem
- Główne elementy:
  * Lista TemporaryCardItem
  * Komunikat "Brak fiszek"
  * Etykiety źródła dla każdej fiszki
- Obsługiwane interakcje:
  * Przewijanie listy
- Typy:
  * `TemporaryCard[]`
- Propsy:
  * `cards: TemporaryCard[]`
  * `onCardUpdate: (tempId: string, updates: Partial<TemporaryCard>) => void`
  * `onCardDelete: (tempId: string) => void`

### TemporaryCardItem
- Opis komponentu: Pojedyncza fiszka tymczasowa z możliwością edycji
- Główne elementy:
  * Wyświetlanie przodu/tyłu
  * Przyciski edycji/usuwania
  * Etykieta źródła
- Obsługiwane interakcje:
  * Otwieranie EditCardDialog do edycji
  * Usuwanie fiszki
- Typy:
  * `TemporaryCard`
- Propsy:
  * `card: TemporaryCard`
  * `onUpdate: (updates: Partial<TemporaryCard>) => void`
  * `onDelete: () => void`

## 5. Typy
```typescript
interface TemporaryCard {
  tempId: string; // lokalny identyfikator dla tymczasowych fiszek
  front: string;
  back: string;
  source: CardSource;
  generation_id?: string;
}

type CardSource = 'ai_generated' | 'ai_edited' | 'user_created';
```

## 6. Zarządzanie stanem
### useTemporaryCards
- Zarządzanie listą tymczasowych fiszek
- Stan: `cards: TemporaryCard[]`
- Metody: 
  * `addCards: (cards: Omit<TemporaryCard, 'tempId'>[]) => void` // automatycznie generuje tempId
  * `updateCard: (tempId: string, updates: Partial<TemporaryCard>) => void` // synchroniczna operacja
  * `deleteCard: (tempId: string) => void` // synchroniczna operacja
  * `submitAll: () => Promise<void>` // jedyna asynchroniczna operacja, wysyła do API

## 7. Integracja API

### Generowanie fiszek
```typescript
POST /api/generations
Request: {
  input_text: string;
}
Response: GenerateFlashcardsResponseDTO
```

### Zapisywanie fiszek
```typescript
POST /api/card-sets/{id}/cards
Request: {
  cards: Array<{
    front: string;
    back: string;
    source: CardSource;
    generation_id?: string;
  }>;
}
Response: {
  cards: CardDTO[];
}
```

## 8. Interakcje użytkownika
1. Przejście do widoku:
   - Kliknięcie "Dodaj fiszki" w widoku zestawu
   - Przekierowanie do widoku dodawania

2. Generowanie przez AI:
   - Wprowadzenie tekstu
   - Kliknięcie "Generuj"
   - Wyświetlenie loadera
   - Dodanie wygenerowanych fiszek do wspólnej listy
   - Możliwość edycji/usunięcia

3. Ręczne dodawanie:
   - Kliknięcie "Dodaj ręcznie"
   - Wypełnienie formularza w EditCardDialog
   - Zatwierdzenie/anulowanie
   - Dodanie fiszki do wspólnej listy
   - Możliwość edycji/usunięcia

4. Zarządzanie fiszkami:
   - Edycja tekstu (wspólny EditCardDialog)
   - Usuwanie fiszek (operacja lokalna)
   - Zatwierdzanie wszystkich (wysyłka do API)

## 9. Warunki i walidacja
1. AIGenerationForm:
   - Tekst: 1000-10000 znaków
   - Blokada przycisku przy nieprawidłowej długości
   - Wyświetlanie pozostałej liczby znaków

2. EditCardDialog:
   - Przód/tył: max 300 znaków
   - Wymagane oba pola
   - Blokada zatwierdzenia przy błędach

## 10. Obsługa błędów
1. Błędy generowania AI:
   - Timeout: komunikat z możliwością ponowienia
   - Błąd serwera: komunikat z możliwością ponowienia
   - Nieprawidłowa odpowiedź: komunikat błędu

2. Błędy zapisu:
   - Konflikt: odświeżenie danych
   - Błąd walidacji: wyświetlenie komunikatów
   - Błąd serwera: możliwość ponowienia

3. Błędy formularza:
   - Walidacja w locie
   - Blokada submitu przy błędach
   - Wyraźne komunikaty błędów

## 11. Kroki implementacji
1. Dodanie przycisku "Dodaj fiszki" do widoku zestawu:
   - Implementacja komponentu AddCardsButton
   - Integracja z istniejącym widokiem
2. Utworzenie podstawowej struktury widoku dodawania
3. Implementacja AIGenerationForm:
   - Formularz z walidacją
   - Integracja z API
   - Obsługa loadera i błędów
4. Adaptacja EditCardDialog:
   - Dostosowanie do trybu dodawania
   - Reużycie dla edycji
5. Implementacja TemporaryCardList i TemporaryCardItem:
   - Bazowanie na strukturze istniejących CardsList i CardItem
   - Dostosowanie do pracy z tymczasowymi fiszkami
   - Integracja z EditCardDialog
   - Lokalne usuwanie fiszek
6. Implementacja zatwierdzania wszystkich fiszek:
   - Integracja z API
   - Obsługa błędów
   - Przekierowanie po sukcesie
7. Dodanie testów jednostkowych
8. Optymalizacja wydajności