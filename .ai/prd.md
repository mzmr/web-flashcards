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
- Logowanie wymaga podania adresu email i hasła.
- Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
- System umożliwia logowanie przy użyciu zarejestrowanych danych.
- Wyświetlane są odpowiednie komunikaty błędów przy nieprawidłowej rejestracji lub logowaniu.
- Logowanie i rejestracja odbywają się na dedykowanych stronach.

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
- Lista zestawów fiszek zawiera wszystkie zestawy, które użytkownik ma zapisane w pamięci lokalnej swojej przeglądarki.
- Lista zestawów fiszek zawiera wszystkie zestawy, które użytkownik ma zapisane w bazie danych.

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

US-008
Tytuł: Przeglądanie szczegółowe zestawu fiszek
Opis: Jako użytkownik chcę przeglądać fiszki należące do wybranego przeze mnie zestawu fiszek, aby móc łatwo zarządzać materiałem edukacyjnym.
Kryteria akceptacji:
- System wyświetla listę fiszek, zawierających przód i tył fiszki, a także etykietę informującą o sposobie jej utworzenia.
- Użytkownik może wybrać konkretną fiszkę, aby ją edytować.

US-009
Tytuł: Tworzenie zestawów fiszek w bazie danych
Opis: Jako zalogowany użytkownik chcę mieć możliwość dodania zestawu fiszek, aby móc dodać do niego fiszki.
Kryteria akceptacji:
- Użytkownik może utworzyć zestaw fiszek z wybraną przez siebie nazwą o długości do 300 znaków.
- Utworzony zestaw fiszek jest zapisany w bazie danych i przypisany do użytkownika, który go stworzył.
- Zestaw fiszek utworzony przez zalogowanego użytkownika NIE może zostać zapisany w pamięci przeglądarki.

US-010
Tytuł: Tworzenie zestawów fiszek po stronie klienta
Opis: Jako niezalogowany użytkownik chcę mieć możliwość dodania zestawu fiszek, aby móc dodać do niego fiszki.
Kryteria akceptacji:
- Użytkownik może utworzyć zestaw fiszek z wybraną przez siebie nazwą o długości do 300 znaków.
- Utworzony zestaw fiszek jest zapisany w lokalnej pamięci przeglądarki (local storage).
- Zestaw fiszek utworzony przez niezalogowanego użytkownika NIE może zostać zapisany w bazie danych.

US-011
Tytuł: Przeniesienie lokalnego zestawu fiszek do bazy danych
Opis: Jako zalogowany użytkownik chcę przenieść do bazy danych wszystkie zestawy fiszek, jakie mam obecnie zapisane lokalnie w pamięci mojej przeglądarki.
Kryteria akceptacji:
- Wszystkie zestawy fiszek istniejące w pamięci lokalnej przeglądarki użytkownika mogą zostać zapisane w bazie danych.
- Wszystkie zestawy fiszek zostają usunięte z pamięci przeglądarki po zapisaniu w bazie danych.
- Użytkownik może jednym przyciskiem zainicjować przeniesienie lokalnych zestawów fiszek do bazy danych.

US-012
Tytuł: Bezpieczny dostęp
Opis: Jako użytkownik chcę ograniczyć dostęp do niektórych funkcjonalności systemu.
Kryteria akceptacji:
- Użytkownik MOŻE tworzyć lokalne zestawy fiszek bez logowania się do systemu (US-010).
- Użytkownik NIE MOŻE tworzyć zestawów fiszek w bazie danych bez logowania się do systemu (US-011).
- Użytkownik NIE MOŻE generować fiszek na podstawie wprowadzonego tekstu za pomocą AI (US-002, US-003).
- Użytkownik MOŻE tworzyć fiszki ręcznie niezależnie od tego, czy jest zalogowany do systemu (US-004).
- Fiszki dodane do lokalego zestawu fiszek zostają zapisane lokalnie w pamięci przeglądarki (US-004, US-010).
- Fiszki dodane do zestawu fiszek zapisanego w bazie danych zostają zapisane w bazie danych (US-003, US-004, US-009).
- Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
- Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
- Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
- Odzyskiwanie hasła powinno być możliwe.

## 6. Metryki sukcesu
- 75% fiszek wygenerowanych przez AI musi być zaakceptowanych przez użytkownika.
- 75% wszystkich fiszek tworzonych w aplikacji powinno pochodzić z generowania przez AI.