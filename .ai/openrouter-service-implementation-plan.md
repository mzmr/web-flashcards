# Plan wdrożenia usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter to komponent integrujący z API OpenRouter w celu wzbogacenia czatów opartych na modelach LLM. Jej głównym zadaniem jest:

1. Wysyłanie komunikatów (zarówno systemowych, jak i użytkownika) do API.
2. Odbieranie i walidacja odpowiedzi, która jest ustrukturyzowana według predefiniowanego schematu JSON.
3. Konfiguracja i kontrola parametrów modelu, takich jak nazwa modelu oraz parametry generacji (np. temperature, max_tokens).

Kluczowe elementy usługi to: konfiguracja, komunikacja z API, przetwarzanie wiadomości oraz obsługa błędów.

## 2. Opis konstruktora

Konstruktor usługi inicjalizuje podstawowe ustawienia, takie jak:

1. Adres URL endpointu OpenRouter.
2. Klucz API oraz domyślna autentykacja.
3. Domyślne ustawienia modelu (nazwa, np. "openRouter-V1" oraz parametry jak temperature, max_tokens, top_p).
4. Konfigurację komunikatu systemowego (np. "System: Jesteś wszechstronnym asystentem, wyszkolonym do udzielania precyzyjnych odpowiedzi.") oraz schemat response_format.

Dzięki temu wszystkie niezbędne dane są dostępne i walidowane przy starcie usługi.

## 3. Publiczne metody i pola

1. **sendMessage(userMessage: string): Promise<Response>**
   - Wysyła komunikat użytkownika do OpenRouter wraz z dołączonym komunikatem systemowym.

2. **configure(options: ConfigOptions): void**
   - Umożliwia aktualizację ustawień usługi, takich jak model, parametry generacji oraz komunikaty.

3. **getLastResponse(): Response | null**
   - Zwraca ostatnią poprawną odpowiedź otrzymaną od OpenRouter.

**Pola publiczne:**

- `apiUrl`: URL endpointu OpenRouter.
- `apiKey`: Klucz API do autoryzacji.
- `modelName`: Nazwa modelu wykorzystywanego do przetwarzania zapytań.
- `modelParams`: Obiekt zawierający parametry modelu (np. temperature, max_tokens, top_p).
- `systemMessage`: Domyślny komunikat systemowy, np. "System: Jesteś wszechstronnym asystentem.".

## 4. Prywatne metody i pola

1. **_prepareRequest(userMessage: string): RequestPayload**
   - Przygotowuje ładunek zapytania poprzez scalenie komunikatu systemowego, komunikatu użytkownika oraz konfiguracji response_format.

2. **_validateResponse(response: any): Response**
   - Waliduje strukturę odpowiedzi przy użyciu zdefiniowanego schematu JSON (np. przy użyciu Zod), aby upewnić się, że odpowiedź jest zgodna z oczekiwaniami.

3. **_handleError(error: any): void**
   - Centralizuje obsługę błędów, logując je i stosując mechanizmy odzyskiwania, takie jak ponowne wysyłanie zapytań.

**Pola prywatne:**

- `_lastResponse`: Przechowuje ostatnią poprawnie zwróconą odpowiedź.
- `_config`: Obiekt zawierający pełną konfigurację usługi.

## 5. Obsługa błędów

Przewidywane scenariusze błędów i ich rozwiązania:

1. **Błąd komunikacji z API (np. timeout, brak połączenia):**
   - Rozwiązanie 1: Implementacja mechanizmu ponawiania zapytań (retry) z odpowiednio ustawionym timeoutem.
   - Rozwiązanie 2: Użycie fallback message oraz logowanie zdarzeń.

2. **Błąd walidacji formatu odpowiedzi:**
   - Rozwiązanie: Walidacja odpowiedzi przy użyciu Zod i odrzucanie odpowiedzi niespełniających schematu.

3. **Błąd autentykacji (niepoprawny klucz API):**
   - Rozwiązanie: Natychmiastowe zatrzymanie przetwarzania i zwrócenie informacji o błędzie autoryzacji.

4. **Przekroczenie limitów API lub błędy serwera:**
   - Rozwiązanie: Wdrożenie mechanizmu backoff oraz monitorowanie statusu API.

## 6. Kwestie bezpieczeństwa

1. Bezpieczne przechowywanie klucza API (używanie zmiennych środowiskowych i bezpiecznych magazynów).
2. Walidacja wszystkich danych wejściowych i wyjściowych przy użyciu Zod schematów.
3. Wymuszenie komunikacji przez HTTPS dla wszystkich żądań do API.
4. Implementacja ograniczeń liczby zapytań (rate limiting) aby chronić usługę przed nadużyciami.
5. Monitorowanie i logowanie błędów, w tym nieautoryzowanych prób dostępu.

## 7. Plan wdrożenia krok po kroku

1. **Konfiguracja środowiska:**
   - Ustawienie zmiennych środowiskowych (klucz API, URL endpointu) w bezpieczny sposób.

2. **Implementacja klasy usługi:**
   - Utworzenie pliku `openrouter.service.ts` w `src/lib/services`.
   - Zaimplementowanie konstruktora inicjującego podstawowe ustawienia i walidację konfiguracji.

3. **Implementacja metod publicznych:**
   - Rozwój metod `sendMessage`, `configure` oraz `getLastResponse`.

4. **Implementacja metod prywatnych:**
   - Zaimplementowanie `_prepareRequest`, `_validateResponse` oraz `_handleError`.

5. **Konfiguracja response_format:**
   - Ustalenie schematu odpowiedzi. Przykład:
     ```json
     { "type": "json_schema", "json_schema": { "name": "ChatResponse", "strict": true, "schema": { "text": { "type": "string" }, "metadata": { "type": "object" } } } }
     ```

6. **Ustawienie przykładowych komunikatów i parametrów:**
   - **Komunikat systemowy:**
     1. Przykład: "System: Jesteś wszechstronnym asystentem, wyszkolonym do udzielania precyzyjnych odpowiedzi."
   - **Komunikat użytkownika:**
     2. Przykład: "Użytkownik: Jak zoptymalizować integrację z OpenRouter API?"
   - **Nazwa modelu:**
     3. Przykład: "openRouter-V1"
   - **Parametry modelu:**
     4. Przykład: `{ "temperature": 0.7, "max_tokens": 150, "top_p": 1 }`

7. **Implementacja obsługi błędów:**
   - Dodanie mechanizmów retry, timeout oraz centralizowanej obsługi błędów w metodzie `_handleError`.
