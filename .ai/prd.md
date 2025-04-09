# Dokument wymagań produktu (PRD) - Web Flashcards

## 1. Przegląd produktu
Web Flashcards to aplikacja webowa umożliwiająca tworzenie fiszek edukacyjnych. Głównym celem produktu jest usprawnienie procesu tworzenia wysokiej jakości fiszek poprzez automatyczne generowanie fiszek z wykorzystaniem AI oraz możliwość manualnej edycji. Produkt ma zastosowanie w metodzie nauki przy użyciu spaced repetition, gdzie użytkownicy mogą łatwo tworzyć, edytować, przeglądać i usuwać fiszki. Aplikacja oferuje również podstawowy system kont użytkowników.

## 2. Problem użytkownika
Użytkownicy często rezygnują z tworzenia fiszek edukacyjnych ze względu na czasochłonność manualnego wprowadzania danych. Brak automatyzacji wpływa negatywnie na efektywność nauki metodą spaced repetition, co skutkuje marnowaniem czasu i obniżeniem motywacji do nauki.

## 3. Wymagania funkcjonalne
1. Generowanie fiszek przez AI:
   - Użytkownik wprowadza tekst o długości od 1000 do 10000 znaków, na podstawie którego AI generuje fiszki.
   - Proces generowania odbywa się synchronicznie z wyświetleniem loadera.
   - Wygenerowane fiszki są tymczasowe i nie trafiają do bazy danych, dopóki użytkownik nie zatwierdzi całego zestawu.
2. Ręczne tworzenie fiszek:
   - Możliwość tworzenia fiszek manualnie, gdzie każda fiszka zawiera dwa pola: przód i tył.
3. Zarządzanie fiszkami:
   - Przeglądanie wszystkich zestawów fiszek.
   - Edycja zawartości fiszek oraz nazwy zestawu.
   - Usuwanie pojedynczych fiszek lub całego zestawu.
4. Struktura pojedynczej fiszki:
   - Unikalny identyfikator UUID (UUID v4).
   - Przód i tył z limitem 300 znaków dla każdego pola.
   - Daty utworzenia i modyfikacji.
5. Zarządzanie zestawami fiszek:
   - Użytkownik nadaje nazwę zestawowi podczas tworzenia lub edycji.
   - Przechowywanie dat utworzenia i modyfikacji zestawu.
6. System kont użytkowników:
   - Rejestracja, logowanie oraz wylogowywanie użytkowników.
   - Bezpieczna komunikacja (HTTPS) przy korzystaniu z aplikacji.
7. Interfejs użytkownika:
   - Intuicyjny design formularzy zawierających placeholdery, labele oraz wskazówki.
   - Standardowe komunikaty walidacyjne w przypadku nieprawidłowej długości tekstu.

## 4. Granice produktu
1. Aplikacja MVP nie obejmuje:
   - Własnego, zaawansowanego algorytmu powtórek (np. SuperMemo, Anki).
   - Importu plików z wielu formatów (PDF, DOCX, itp.).
   - Współdzielenia zestawów fiszek między użytkownikami.
   - Integracji z innymi platformami edukacyjnymi.
   - Aplikacji mobilnych (na początek wyłącznie wersja web).

## 5. Historyjki użytkowników
US-001
Tytuł: Rejestracja i logowanie
Opis: Jako użytkownik chcę móc się zarejestrować oraz zalogować do systemu, aby korzystać z pełnej funkcjonalności aplikacji.
Kryteria akceptacji:
- Użytkownik może zarejestrować się, podając unikalny adres email i hasło.
- System umożliwia logowanie przy użyciu zarejestrowanych danych.
- Wyświetlane są odpowiednie komunikaty błędów przy nieprawidłowej rejestracji lub logowaniu.

US-002
Tytuł: Wprowadzanie tekstu do generowania fiszek przez AI
Opis: Jako użytkownik chcę wprowadzić tekst o długości od 1000 do 10000 znaków, aby AI mogło wygenerować na jego podstawie fiszki.
Kryteria akceptacji:
- System akceptuje tekst mieszczący się w określonym przedziale znaków.
- W przypadku nieprawidłowej długości tekstu wyświetlany jest komunikat walidacyjny.
- Po wprowadzeniu prawidłowego tekstu uruchamiany jest proces generowania z wyświetleniem loadera.

US-003
Tytuł: Generowanie fiszek przez AI
Opis: Jako użytkownik chcę, aby system wygenerował zestaw fiszek na podstawie wprowadzonego tekstu, umożliwiając mi ich przegląd i ewentualną edycję przed zatwierdzeniem.
Kryteria akceptacji:
- Fiszki są generowane synchronicznie z wyświetleniem loadera.
- Wygenerowane fiszki są tymczasowe i nie zapisują się w bazie danych do momentu zatwierdzenia przez użytkownika.
- Użytkownik ma możliwość edycji wygenerowanych fiszek przed ich zatwierdzeniem.

US-004
Tytuł: Ręczne tworzenie fiszek
Opis: Jako użytkownik chcę mieć możliwość ręcznego tworzenia fiszek, aby móc dostosować treść do moich indywidualnych potrzeb.
Kryteria akceptacji:
- Użytkownik może wprowadzać przód i tył z limitem 300 znaków na każde pole.
- Formularz zawiera odpowiednie wskazówki, placeholdery i labele.
- System waliduje długość tekstu i wyświetla komunikat błędu przy przekroczeniu limitu.

US-005
Tytuł: Przeglądanie zestawów fiszek
Opis: Jako użytkownik chcę przeglądać wszystkie moje zestawy fiszek, aby móc łatwo zarządzać materiałem edukacyjnym.
Kryteria akceptacji:
- System wyświetla listę zestawów fiszek, zawierającą nazwę, oraz daty utworzenia i modyfikacji.
- Użytkownik może wybrać konkretny zestaw, aby przejrzeć jego zawartość.

US-006
Tytuł: Edycja fiszek i zestawu
Opis: Jako użytkownik chcę móc edytować zawartość fiszek oraz nazwę zestawu przed ostatecznym zatwierdzeniem, aby wprowadzić niezbędne poprawki.
Kryteria akceptacji:
- Użytkownik może modyfikować treść przodu i tyłu z zachowaniem limitu 300 znaków.
- Nazwa zestawu jest edytowalna.
- Zmiany są zapisywane z aktualizacją daty modyfikacji.

US-007
Tytuł: Usuwanie fiszek i zestawu
Opis: Jako użytkownik chcę mieć możliwość usunięcia pojedynczych fiszek lub całego zestawu, aby zarządzać zawartością swojego konta.
Kryteria akceptacji:
- Użytkownik może usunąć pojedynczą fiszkę lub cały zestaw.
- System prosi o potwierdzenie przed wykonaniem operacji usuwania.
- Po usunięciu zmiany są widoczne w interfejsie.

## 6. Metryki sukcesu
- 75% fiszek wygenerowanych przez AI musi być zaakceptowanych przez użytkownika.
- 75% wszystkich fiszek tworzonych w aplikacji powinno pochodzić z generowania przez AI.