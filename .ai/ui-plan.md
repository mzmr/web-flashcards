# Architektura UI dla Web Flashcards

## 1. Przegląd struktury UI

- Aplikacja dzieli się na kilka kluczowych widoków: logowania/rejestracji, listy zestawów fiszek, szczegółowego widoku zestawu, widoku dodawania fiszek oraz sesji powtórkowych.
- Struktura oparta jest na komponentach React, z wykorzystaniem Tailwind CSS i shadcn/ui, co zapewnia responsywność, dostępność i nowoczesny design.

## 2. Lista widoków

### Widok logowania i rejestracji
- **Ścieżka widoku**: `/login` oraz `/register`
- **Główny cel**: Umożliwienie użytkownikowi logowania i rejestracji.
- **Kluczowe informacje do wyświetlenia**: Formularze autoryzacji, komunikaty błędów walidacji.
- **Kluczowe komponenty widoku**: Formularze, pola tekstowe, przyciski, walidacja formularza.
- **UX, dostępność i względy bezpieczeństwa**: Czytelne etykiety, aria-attributes, prosty interfejs.

### Widok listy zestawów fiszek
- **Ścieżka widoku**: `/card-sets`
- **Główny cel**: Wyświetlenie wszystkich zestawów fiszek użytkownika oraz umożliwienie dodania nowego zestawu.
- **Kluczowe informacje do wyświetlenia**: Liczba zestawów wyświetlana u góry, lista zestawów posortowana malejąco wg daty ostatniej modyfikacji.
- **Kluczowe komponenty widoku**: Komponent listy, element podsumowania, przycisk inicjujący dodanie zestawu, modal do dodawania nowego zestawu z polem tekstowym i dwoma przyciskami (Dodaj, Anuluj).
- **UX, dostępność i względy bezpieczeństwa**: Łatwa nawigacja, czytelne prezentowanie danych, zabezpieczenia poprzez autoryzację użytkownika.

### Widok szczegółowy zestawu fiszek
- **Ścieżka widoku**: `/card-sets/:id`
- **Główny cel**: Prezentacja wszystkich fiszek należących do wybranego zestawu oraz umożliwienie ich edycji/usunięcia.
- **Kluczowe informacje do wyświetlenia**: Lista fiszek, szczegóły fiszek (przód, tył), wyniki wyszukiwania.
- **Kluczowe komponenty widoku**: Lista elementów, pole wyszukiwarki, przyciski edycji i usuwania, modal do edycji, przycisk powrotu do listy zestawów.
- **UX, dostępność i względy bezpieczeństwa**: Inline komunikaty błędów, mechanizmy walidacji, dostępność poprzez poprawne zarządzanie focus, czytelny design.

### Widok dodawania fiszek
- **Ścieżka widoku**: `/card-sets/:id/add-cards`
- **Główny cel**: Umożliwienie dodania nowych fiszek do wybranego zestawu, zarówno przez generowanie AI, jak i ręczne dodawanie.
- **Kluczowe informacje do wyświetlenia**: Pole tekstowe do wprowadzenia tekstu źródłowego do generowania fiszek, lista tymczasowych fiszek wygenerowanych przez AI, przycisk otwierający modal do ręcznego dodawania.
- **Kluczowe komponenty widoku**: Formularz generacji AI z loaderem, modal z dwoma polami (przód i tył) i dwoma przyciskami (Dodaj, Anuluj), etykiety rozróżniające źródło fiszki ("Wygenerowana przez AI" vs. "Utworzona ręcznie"), przycisk powrotu do widoku szczegółowego zestawu.
- **UX, dostępność i względy bezpieczeństwa**: Walidacja zgodnie z limitem znaków, informacyjne komunikaty, responsywność oraz poprawne zarządzanie modalami (focus management, dostępność przez klawiaturę).

### Widok sesji powtórkowych
- **Ścieżka widoku**: `/review-sessions`
- **Główny cel**: Umożliwienie użytkownikowi rozpoczęcia sesji powtórek opartych na fiszkach.
- **Kluczowe informacje do wyświetlenia**: Przód fiszki, przycisk do pokazania tyłu fiszki, mechanizm zbierania feedbacku.
- **Kluczowe komponenty widoku**: Komponent fiszki z odkrywanym tyłem, przyciski akcji.
- **UX, dostępność i względy bezpieczeństwa**: Jasne komunikaty, intuicyjne sterowanie, dostępność zgodna z WCAG AA.

## 3. Mapa podróży użytkownika

- Użytkownik rozpoczyna przy widoku logowania/rejestracji.
- Po autoryzacji następuje przekierowanie do widoku listy zestawów fiszek, gdzie wyświetlana jest liczba zestawów oraz lista uporządkowana wg daty modyfikacji (najnowsze na górze).
- Wybierając konkretny zestaw, użytkownik trafia do widoku szczegółowego, gdzie może wyszukiwać, edytować lub usuwać fiszki.
- Użytkownik przechodzi do widoku dodawania fiszek, wciskając przycisk "Dodaj fiszki", po czym wprowadza tekst dla trybu generowania AI lub dodaje fiszki ręcznie przez modal.
- Po wykonaniu operacji pojawiają się komunikaty informacyjne, a użytkownik może nawigować z powrotem do listy zestawów lub przejść do sesji powtórkowych.

## 4. Układ i struktura nawigacji

- Główna nawigacja umieszczona jest w pasku widocznym na wszystkich stronach autoryzowanych, zawierającym linki do:
  - Zestawów fiszek
  - Sesji powtórkowych
  - Przycisku "Wyloguj"
- Na urządzeniach mobilnych nawigacja jest dostępna poprzez hamburger menu, zapewniając oszczędność miejsca.
- Interfejs zawiera również elementy komunikatów błędów oraz informacyjnych umieszczonych strategicznie przy przyciskach lub u góry ekranu.

## 5. Kluczowe komponenty

- **Formularze autoryzacyjne**: Komponenty logowania i rejestracji z walidacją i odpowiednimi komunikatami błędów.
- **Lista zestawów fiszek**: Komponent renderujący dynamiczną listę zestawów oraz liczbę wyświetlonych zestawów.
- **Wyszukiwarka**: Prosty komponent filtrujący fiszki w widoku szczegółowym zestawu.
- **Modal edycji/dodawania**: Komponent obsługujący dodawanie lub edycję fiszek.
- **Modal dodawania zestawu**: Komponent obsługujący dodawanie zestawu.
- **Loader**: Komponent wyświetlający stan ładowania podczas generowania fiszek przez AI, pobierania i aktualizacji danych przez API.
- **Nawigacja główna**: Pasek nawigacji z adaptacyjnym wyglądem dla urządzeń desktopowych i mobilnych.
- **Komunikaty informacyjne i błędy**: Elementy UI prezentujące status operacji i błędy inline, które pozostają widoczne do momentu zamknięcia przez użytkownika.
- **Przycisk powrotu**: Komponent umożliwiający powrót do poprzedniego widoku.
