# Plan implementacji widoku szczegółów zestawu fiszek

## 1. Przegląd
Widok szczegółów zestawu fiszek to strona pozwalająca użytkownikowi na przeglądanie wszystkich fiszek należących do wybranego zestawu oraz zarządzanie nimi. Umożliwia edycję lub usunięcie pojedynczych fiszek, edycję nazwy zestawu oraz usunięcie całego zestawu. Widok oferuje również funkcję wyszukiwania fiszek w obrębie zestawu.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/card-sets/:id`, gdzie `:id` to unikalny identyfikator zestawu fiszek (UUID).

## 3. Struktura komponentów
```
CardSetDetailsPage
├── CardSetHeader
│   ├── CardSetTitle
│   ├── EditCardSetNameButton
│   ├── DeleteCardSetButton
│   └── BackToCardSetsButton
├── CardSetSearchBar
├── CardsList
│   └── CardItem
│       ├── CardContent
│       ├── CardSourceBadge
│       ├── EditCardButton
│       └── DeleteCardButton
├── EditCardSetNameModal
├── DeleteCardSetConfirmDialog
├── EditCardModal
└── DeleteCardConfirmDialog
```

## 4. Szczegóły komponentów
### CardSetDetailsPage
- Opis komponentu: Główny komponent widoku, odpowiedzialny za pobieranie danych zestawu fiszek i koordynowanie interakcji między komponentami.
- Główne elementy: Container z nagłówkiem (CardSetHeader), wyszukiwarką (CardSetSearchBar) i listą kart (CardsList).
- Obsługiwane interakcje: Inicjalizacja widoku, obsługa wyszukiwania, przekazywanie danych do komponentów podrzędnych.
- Obsługiwana walidacja: Weryfikacja poprawności id zestawu fiszek (UUID).
- Typy: CardSetDetailDTO, UUID.
- Propsy: Brak (komponent na najwyższym poziomie).

### CardSetHeader
- Opis komponentu: Nagłówek zawierający tytuł zestawu, przyciski do edycji nazwy i usunięcia zestawu oraz przycisk powrotu.
- Główne elementy: Tytuł (CardSetTitle), przyciski akcji (EditCardSetNameButton, DeleteCardSetButton, BackToCardSetsButton).
- Obsługiwane interakcje: Kliknięcie przycisków akcji.
- Obsługiwana walidacja: Brak.
- Typy: CardSetDTO.
- Propsy: cardSet, onEditName, onDelete.

### CardSetSearchBar
- Opis komponentu: Pole wyszukiwania umożliwiające filtrowanie fiszek.
- Główne elementy: Input z ikoną wyszukiwania.
- Obsługiwane interakcje: Wprowadzanie tekstu, czyszczenie pola.
- Obsługiwana walidacja: Brak.
- Typy: Brak.
- Propsy: value, onChange, onClear.

### CardsList
- Opis komponentu: Lista wyświetlająca fiszki należące do zestawu.
- Główne elementy: Grid lub flex container zawierający komponenty CardItem.
- Obsługiwane interakcje: Brak bezpośrednich interakcji (delegowane do CardItem).
- Obsługiwana walidacja: Brak.
- Typy: CardDTO[].
- Propsy: cards, onEditCard, onDeleteCard.

### CardItem
- Opis komponentu: Element reprezentujący pojedynczą fiszkę w zestawie.
- Główne elementy: Komponent Card zawierający przód i tył fiszki, etykietę źródła oraz przyciski edycji i usunięcia.
- Obsługiwane interakcje: Kliknięcie przycisków edycji i usunięcia.
- Obsługiwana walidacja: Brak.
- Typy: CardDTO.
- Propsy: card, onEdit, onDelete.

### EditCardSetNameModal
- Opis komponentu: Modal umożliwiający edycję nazwy zestawu fiszek.
- Główne elementy: Formularz z polem tekstowym i przyciskami anuluj/zapisz.
- Obsługiwane interakcje: Wprowadzanie tekstu, zatwierdzanie formularza.
- Obsługiwana walidacja: Nazwa zestawu - wymagana, min. 1 znak, max. 100 znaków.
- Typy: CardSetDTO.
- Propsy: isOpen, onClose, cardSet, onSave.

### DeleteCardSetConfirmDialog
- Opis komponentu: Dialog potwierdzający usunięcie zestawu fiszek.
- Główne elementy: Tekst ostrzeżenia, przyciski anuluj/usuń.
- Obsługiwane interakcje: Kliknięcie przycisków.
- Obsługiwana walidacja: Brak.
- Typy: CardSetDTO.
- Propsy: isOpen, onClose, cardSet, onConfirm.

### EditCardModal
- Opis komponentu: Modal umożliwiający edycję fiszki.
- Główne elementy: Formularz z polami tekstowymi dla przodu i tyłu fiszki, przyciski anuluj/zapisz.
- Obsługiwane interakcje: Wprowadzanie tekstu, zatwierdzanie formularza.
- Obsługiwana walidacja: Przód i tył fiszki - wymagane, min. 1 znak, max. 300 znaków.
- Typy: CardDTO, UpdateCardCommand.
- Propsy: isOpen, onClose, card, onSave.

### DeleteCardConfirmDialog
- Opis komponentu: Dialog potwierdzający usunięcie fiszki.
- Główne elementy: Tekst ostrzeżenia, przyciski anuluj/usuń.
- Obsługiwane interakcje: Kliknięcie przycisków.
- Obsługiwana walidacja: Brak.
- Typy: CardDTO.
- Propsy: isOpen, onClose, card, onConfirm.

## 5. Typy
```typescript
// Interfejs widoku
interface CardSetDetailsViewModel {
  isLoading: boolean;
  error: string | null;
  cardSet: CardSetDetailDTO | null;
  filteredCards: CardDTO[] | null;
  searchTerm: string;
}

// Do edycji nazwy zestawu
interface EditCardSetNameFormData {
  name: string;
}

// Do edycji fiszki
interface EditCardFormData {
  front: string;
  back: string;
}
```

## 6. Zarządzanie stanem
Zarządzanie stanem będzie realizowane za pomocą hooków Reacta:

```typescript
// Hook zapewniający podstawowe operacje na zestawie fiszek
function useCardSetDetails(cardSetId: UUID) {
  const [state, setState] = useState<CardSetDetailsViewModel>({
    isLoading: true,
    error: null,
    cardSet: null,
    filteredCards: null,
    searchTerm: ""
  });

  // Metody zarządzające stanem:
  // - fetchCardSet: pobieranie zestawu
  // - updateCardSetName: aktualizacja nazwy zestawu
  // - deleteCardSet: usunięcie zestawu
  // - updateCard: aktualizacja fiszki
  // - deleteCard: usunięcie fiszki
  // - setSearchTerm: ustawienie terminu wyszukiwania
  // - filterCards: filtrowanie fiszek wg terminu wyszukiwania

  return {
    ...state,
    updateCardSetName,
    deleteCardSet,
    updateCard,
    deleteCard,
    setSearchTerm,
  };
}
```

## 7. Integracja API
Widok korzysta z następujących endpointów API:

1. **Pobieranie szczegółów zestawu**:
   - `GET /api/card-sets/{cardSetId}`
   - Odpowiedź: CardSetDetailDTO

2. **Aktualizacja nazwy zestawu**:
   - `PUT /api/card-sets/{cardSetId}`
   - Request: `{ name: string }`
   - Odpowiedź: CardSetDTO

3. **Usunięcie zestawu**:
   - `DELETE /api/card-sets/{cardSetId}`
   - Odpowiedź: `{ message: string }`

4. **Aktualizacja fiszki**:
   - `PUT /api/card-sets/{cardSetId}/cards/{cardId}`
   - Request: `{ front: string, back: string }`
   - Odpowiedź: CardDTO

5. **Usunięcie fiszki**:
   - `DELETE /api/card-sets/{cardSetId}/cards/{cardId}`
   - Odpowiedź: `{ message: string }`

## 8. Interakcje użytkownika
1. **Przeglądanie fiszek**:
   - Użytkownik wchodzi na stronę `/card-sets/:id`
   - System pobiera dane zestawu i wyświetla listę fiszek

2. **Wyszukiwanie fiszek**:
   - Użytkownik wprowadza tekst w polu wyszukiwania
   - Lista fiszek jest filtrowana w czasie rzeczywistym

3. **Edycja nazwy zestawu**:
   - Użytkownik klika przycisk edycji nazwy
   - System wyświetla modal z formularzem
   - Użytkownik wprowadza nową nazwę i zatwierdza
   - System zapisuje zmiany i aktualizuje widok

4. **Usunięcie zestawu**:
   - Użytkownik klika przycisk usunięcia zestawu
   - System wyświetla dialog potwierdzenia
   - Użytkownik potwierdza
   - System usuwa zestaw i przekierowuje na listę zestawów

5. **Edycja fiszki**:
   - Użytkownik klika przycisk edycji na fiszce
   - System wyświetla modal z formularzem
   - Użytkownik modyfikuje przód i/lub tył fiszki i zatwierdza
   - System zapisuje zmiany i aktualizuje listę fiszek

6. **Usunięcie fiszki**:
   - Użytkownik klika przycisk usunięcia na fiszce
   - System wyświetla dialog potwierdzenia
   - Użytkownik potwierdza
   - System usuwa fiszkę i aktualizuje listę

## 9. Warunki i walidacja
1. **Nazwa zestawu**:
   - Pole wymagane
   - Minimalna długość: 1 znak
   - Maksymalna długość: 100 znaków

2. **Przód i tył fiszki**:
   - Oba pola wymagane
   - Minimalna długość każdego pola: 1 znak
   - Maksymalna długość każdego pola: 300 znaków

3. **Walidacja UUID**:
   - Identyfikator zestawu musi być poprawnym UUID v4

## 10. Obsługa błędów
1. **Błąd pobierania zestawu**:
   - Komunikat o błędzie i przycisk ponowienia próby

2. **Błąd aktualizacji nazwy zestawu**:
   - Komunikat o błędzie w modalu edycji

3. **Błąd usunięcia zestawu**:
   - Komunikat o błędzie w dialogu potwierdzenia

4. **Błąd edycji fiszki**:
   - Komunikat o błędzie w modalu edycji

5. **Błąd usunięcia fiszki**:
   - Komunikat o błędzie w dialogu potwierdzenia

6. **Niewłaściwy identyfikator zestawu**:
   - Komunikat "Nie znaleziono zestawu" i przekierowanie do listy zestawów

## 11. Kroki implementacji
1. Utwórz plik strony `src/pages/card-sets/[id].astro`
2. Utwórz główny komponent `src/components/CardSetDetailsPage.tsx`
3. Zaimplementuj hook `useCardSetDetails` do zarządzania stanem
4. Utwórz komponenty podrzędne:
   - CardSetHeader
   - CardSetSearchBar
   - CardsList
   - CardItem
5. Zaimplementuj modalne okna dialogowe:
   - EditCardSetNameModal
   - DeleteCardSetConfirmDialog
   - EditCardModal
   - DeleteCardConfirmDialog
6. Zintegruj wywołania API w hooku useCardSetDetails
7. Zaimplementuj funkcjonalność wyszukiwania fiszek
8. Dodaj obsługę błędów i walidację formularzy
9. Przetestuj wszystkie interakcje użytkownika
10. Zoptymalizuj wydajność (ograniczenie re-renderów, memoizacja, etc.) 