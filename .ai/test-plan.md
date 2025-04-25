# Plan Testów dla Projektu Web-Flashcards

## 1. Wprowadzenie i cele testowania

Niniejszy plan testów definiuje strategię, zakres, metody oraz podejście do testowania aplikacji Web-Flashcards. Aplikacja jest systemem do tworzenia i zarządzania zestawami fiszek edukacyjnych z możliwością generowania fiszek przy pomocy sztucznej inteligencji.

**Cele testowania:**
- Weryfikacja poprawności działania wszystkich funkcjonalności aplikacji
- Sprawdzenie integracji między frontendem a backendem
- Zapewnienie responsywności interfejsu użytkownika
- Weryfikacja jakości generowanych fiszek przez AI
- Sprawdzenie wydajności i bezpieczeństwa aplikacji

## 2. Zakres testów

**Zakres funkcjonalny:**
- Zarządzanie zestawami fiszek (tworzenie, edycja, usuwanie)
- System autentykacji użytkowników
- Generowanie fiszek przy pomocy AI
- Edycja i zarządzanie fiszkami (dodawanie, modyfikacja, usuwanie)
- Przechowywanie danych lokalnie i w chmurze
- Integracja z Supabase jako backendem

**Zakres niefunkcjonalny:**
- Responsywność interfejsu użytkownika
- Wydajność aplikacji
- Bezpieczeństwo danych
- Dostępność (a11y)
- Kompatybilność z różnymi przeglądarkami

## 3. Typy testów

### 3.1. Testy jednostkowe
**Cel:** Weryfikacja poprawności działania poszczególnych komponentów i funkcji
**Narzędzia:** Vitest, React Testing Library
**Zakres:**
- Komponenty React (szczególnie hooki niestandardowe)
- Funkcje pomocnicze i narzędziowe
- Walidacja formularzy i schematów Zod

### 3.2. Testy integracyjne
**Cel:** Sprawdzenie komunikacji między komponentami i integracji z backendem
**Narzędzia:** Playwright
**Zakres:**
- Integracja z Supabase
- Komunikacja z OpenRouter.ai
- Przepływ danych między komponentami
- Przechowywanie i pobieranie danych z localStorage

### 3.3. Testy E2E (End-to-End)
**Cel:** Weryfikacja kompletnych ścieżek użytkownika
**Narzędzia:** Playwright  
**Zakres:**
- Przepływy logowania i rejestracji
- Tworzenie zestawów fiszek i zapisywanie ich
- Generowanie fiszek przez AI
- Synchronizacja danych między localStorage a bazą danych

### 3.4. Testy wydajnościowe
**Cel:** Analiza wydajności aplikacji
**Narzędzia:** Lighthouse, WebPageTest
**Zakres:**
- Czas ładowania strony
- Wydajność komponentów React
- Wydajność zapytań do API
- Obsługa dużych zestawów fiszek

### 3.5. Testy dostępności (a11y)
**Cel:** Zapewnienie dostępności dla wszystkich użytkowników
**Narzędzia:** axe, Lighthouse
**Zakres:**
- Zgodność z WCAG 2.1
- Obsługa czytników ekranu
- Nawigacja klawiaturą
- Kontrast i czytelność

### 3.6. Testy bezpieczeństwa
**Cel:** Identyfikacja i eliminacja luk bezpieczeństwa
**Narzędzia:** OWASP ZAP, ESLint (security plugins)
**Zakres:**
- Zabezpieczenie API
- Autentykacja i autoryzacja
- Ochrona przed CSRF, XSS i SQL Injection
- Zarządzanie kluczami API (OpenRouter)

### 3.7. Testy offline
**Cel:** Sprawdzenie działania aplikacji w trybie offline
**Narzędzia:** Chrome DevTools (Network throttling)
**Zakres:**
- Zapisywanie danych lokalnie
- Synchronizacja po ponownym połączeniu
- Obsługa błędów połączenia

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Autentykacja i zarządzanie kontem
- Rejestracja nowego użytkownika
- Logowanie istniejącego użytkownika
- Resetowanie hasła
- Ustawianie nowego hasła
- Wylogowanie użytkownika
- Zabezpieczenie stron wymagających logowania

### 4.2. Zarządzanie zestawami fiszek
- Tworzenie nowego zestawu fiszek
- Edycja nazwy zestawu fiszek
- Usuwanie zestawu fiszek
- Wyświetlanie listy zestawów
- Filtrowanie i wyszukiwanie zestawów
- Zapisywanie zestawu lokalnie
- Synchronizacja zestawu z chmurą

### 4.3. Zarządzanie fiszkami
- Ręczne dodawanie fiszek do zestawu
- Edycja istniejących fiszek
- Usuwanie fiszek
- Przeglądanie fiszek w zestawie
- Walidacja zawartości fiszek

### 4.4. Generowanie fiszek przez AI
- Wprowadzanie tekstu do generacji fiszek
- Przetwarzanie tekstu przez OpenRouter
- Wyświetlanie wygenerowanych fiszek
- Edycja wygenerowanych fiszek
- Zatwierdzanie fiszek do dodania
- Obsługa błędów API i limitów

### 4.5. Obsługa trybu offline i synchronizacja
- Działanie aplikacji bez połączenia internetowego
- Zapisywanie zmian lokalnie
- Synchronizacja po przywróceniu połączenia
- Rozwiązywanie konfliktów synchronizacji danych między lokalnym storage a bazą danych

### 4.6. Testy regresyjne
- Automatyczne wykonywanie pełnych testów funkcjonalnych przy każdej zmianie w kodzie.
- Weryfikacja integralności wszystkich kluczowych ścieżek użytkownika.

## 5. Środowisko testowe

### 5.1. Środowisko deweloperskie
- Lokalna instancja Supabase
- Konfiguracja OpenRouter z kluczem testowym
- Node.js w aktualnej wersji LTS
- Astro dev server

### 5.2. Środowisko testowe (staging)
- Testowa instancja Supabase
- Konfiguracja OpenRouter z ograniczeniami stawek
- Kontener Docker w środowisku staging
- Replika struktury bazy danych produkcyjnej

### 5.3. Środowisko produkcyjne
- Produkcyjna instancja Supabase
- Produkcyjny klucz API OpenRouter
- DigitalOcean hosting

## 6. Narzędzia do testowania

### 6.1. Testowanie frontendu
- Vitest dla testów jednostkowych
- React Testing Library do testowania komponentów
- Playwright do testów E2E
- axe-core do testów dostępności
- Lighthouse do analizy wydajności

### 6.2. Testowanie backendu
- Narzędzia do testowania API (Postman, Insomnia)
- Narzędzia do testowania baz danych Supabase
- Narzędzia bezpieczeństwa (OWASP ZAP)
- Narzędzia do testowania API (Postman, Insomnia)
- Narzędzia do testowania baz danych Supabase
- Narzędzia bezpieczeństwa (OWASP ZAP, ESLint security plugins, Snyk)

### 6.3. Narzędzia CI/CD
- GitHub Actions do automatyzacji testów
- Docker do konteneryzacji środowiska testowego

## 7. Harmonogram testów

### 7.1. Testowanie ciągłe
- Testy jednostkowe przy każdym pull request
- Linting i statyczna analiza kodu
- Testy dostępności podstawowych komponentów

### 7.2. Testowanie iteracyjne
- Testy integracyjne po zakończeniu każdej większej funkcjonalności
- Testy E2E po połączeniu kilku funkcjonalności

### 7.3. Testowanie pre-release
- Pełne testy E2E przed wydaniem
- Testy wydajnościowe
- Testy bezpieczeństwa
- Testy dostępności

## 8. Kryteria akceptacji testów

### 8.1. Kryteria ogólne
- Wszystkie testy jednostkowe przechodzą
- Testy E2E kluczowych ścieżek użytkownika przechodzą
- Brak krytycznych błędów bezpieczeństwa
- Zgodność z WCAG 2.1 na poziomie AA

### 8.2. Kryteria wydajnościowe
- Czas pierwszego renderowania poniżej 1.5s
- Score Lighthouse dla wydajności powyżej 90
- Czas odpowiedzi API poniżej 500ms dla 95% żądań
 
### 8.3. Kryteria szczegółowe
- Testy integracyjne: pełne pokrycie komunikacji z Supabase i OpenRouter, w tym obsługa limitów API.
- Testy bezpieczeństwa: brak krytycznych luk, potwierdzony m.in. przez narzędzia takie jak Snyk.
- Testy dostępności: spełnienie wymogów WCAG 2.1 na poziomie AA, zweryfikowane za pomocą narzędzi, takich jak axe.

### 8.4. Kryteria dotyczące AI
- Minimalna jakość generowanych fiszek (mierzalna przez recenzentów)
- Czas generowania zestawu fiszek poniżej 10 sekund

## 9. Role i odpowiedzialności w procesie testowania

### 9.1. Deweloperzy
- Pisanie i wykonywanie testów jednostkowych
- Zapewnienie pokrycia testami nowych funkcjonalności
- Naprawianie błędów wykrytych podczas testów

### 9.2. Testerzy QA
- Projektowanie i wykonywanie testów integracyjnych i E2E
- Raportowanie i śledzenie błędów
- Weryfikacja naprawionych błędów

### 9.3. DevOps
- Konfiguracja i utrzymanie środowisk testowych
- Zarządzanie infrastrukturą CI/CD
- Monitorowanie wydajności aplikacji

## 10. Procedury raportowania błędów

### 10.1. Format zgłaszania błędów
- Tytuł: krótki opis problemu
- Środowisko: gdzie wystąpił błąd
- Kroki reprodukcji: dokładna sekwencja działań
- Oczekiwane zachowanie: co powinno się zdarzyć
- Aktualne zachowanie: co się faktycznie dzieje
- Materiały: zrzuty ekranu, logi, nagrania
- Priorytet: krytyczny, wysoki, średni, niski

### 10.2. Proces obsługi błędów
- Zgłoszenie błędu w systemie śledzenia (GitHub Issues)
- Triaging i przypisanie priorytetu
- Przydzielenie do odpowiedniego dewelopera
- Naprawa błędu
- Weryfikacja naprawy przez QA
- Zamknięcie zgłoszenia

## 11. Zarządzanie ryzykiem testowym

### 11.1. Ryzyka techniczne
- Problemy z integracją Supabase
- Limity API OpenRouter.ai
- Problemy z wydajnością przy dużych zbiorach fiszek
- Brak kompatybilności z niektórymi przeglądarkami

### 11.2. Strategie mitygacji ryzyka
- Testy integracyjne dla Supabase
- Monitorowanie limitów API i mechanizmy fallbacku
- Testy wydajnościowe z dużymi zestawami danych
- Cross-browser testing

## 12. Nadzór i raportowanie postępów testów

### 12.1. Metryki testowe
- Pokrycie kodu testami
- Liczba i priorytet otwartych błędów
- Liczba zamkniętych błędów
- Czas potrzebny na naprawę błędów

### 12.2. Raporty testowe
- Codzienny status testów automatycznych (CI/CD)
- Tygodniowy raport z postępu testów manualnych
- Raport przed wydaniem nowej wersji

Plan testów będzie aktualizowany w miarę rozwoju projektu i identyfikacji nowych obszarów wymagających testowania.
