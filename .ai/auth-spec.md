# Specyfikacja architektury modułu autentykacji

## 1. Architektura interfejsu użytkownika

### 1.1. Struktura stron i komponentów

#### Nowe strony Astro (SSR)
- `/src/pages/auth/login.astro` - strona logowania
- `/src/pages/auth/register.astro` - strona rejestracji
- `/src/pages/auth/reset-password.astro` - strona resetowania hasła
- `/src/pages/auth/set-new-password.astro` - strona ustawiania nowego hasła

#### Nowe komponenty React
- `/src/components/auth/LoginForm.tsx` - formularz logowania
- `/src/components/auth/RegisterForm.tsx` - formularz rejestracji
- `/src/components/auth/ResetPasswordForm.tsx` - formularz resetowania hasła
- `/src/components/auth/SetNewPasswordForm.tsx` - formularz ustawiania nowego hasła
- `/src/components/auth/AuthStatus.tsx` - komponent wyświetlający status autentykacji w prawym górnym rogu (login/logout)

#### Modyfikacje istniejących komponentów
- `/src/layouts/Layout.astro` - dodanie komponentu AuthStatus w prawym górnym rogu
- Wszystkie strony wymagające autentykacji - dodanie middleware sprawdzającego sesję

### 1.2. Przepływ danych i interakcje

#### Logowanie
1. Użytkownik wchodzi na `/auth/login`
2. Formularz zawiera pola:
   - Email (walidacja: format email)
   - Hasło (walidacja: min. 8 znaków)
3. Po poprawnym logowaniu:
   - Przekierowanie na stronę główną
   - Aktualizacja AuthStatus
4. Obsługa błędów:
   - Nieprawidłowe dane logowania
   - Konto nie istnieje
   - Błędy sieciowe

#### Rejestracja
1. Użytkownik wchodzi na `/auth/register`
2. Formularz zawiera pola:
   - Email (walidacja: format email)
   - Hasło (walidacja: min. 8 znaków, znaki specjalne)
   - Potwierdzenie hasła (walidacja: zgodność z hasłem)
3. Po poprawnej rejestracji:
   - Automatyczne logowanie
   - Przekierowanie na stronę główną
4. Obsługa błędów:
   - Email już istnieje
   - Hasła nie są zgodne
   - Błędy sieciowe

#### Resetowanie hasła
1. Użytkownik wchodzi na `/auth/reset-password`
2. Formularz zawiera pole email
3. Po wysłaniu:
   - Informacja o wysłaniu linku
   - Link w emailu prowadzi do `/auth/set-new-password?token=xxx`
4. Obsługa błędów:
   - Email nie istnieje
   - Błędy wysyłki emaila

### 1.3. Walidacja i komunikaty

#### Walidacja client-side
- Wykorzystanie biblioteki Zod do walidacji formularzy
- Walidacja w czasie rzeczywistym podczas wpisywania
- Blokada submit dla niepoprawnych danych

#### Komunikaty błędów
- Wykorzystanie komponentów Toast z shadcn/ui
- Precyzyjne komunikaty dla konkretnych przypadków
- Obsługa błędów sieciowych i nieoczekiwanych

## 2. Logika backendowa

### 2.1. Endpointy API

#### Autentykacja (/src/pages/api/auth/*)
```typescript
POST /api/auth/login
Request: { email: string, password: string }
Response: { user: User, session: Session }

POST /api/auth/register
Request: { email: string, password: string }
Response: { user: User, session: Session }

POST /api/auth/logout
Response: { success: boolean }

POST /api/auth/reset-password
Request: { email: string }
Response: { success: boolean }

POST /api/auth/set-new-password
Request: { token: string, password: string }
Response: { success: boolean }
```

### 2.2. Middleware (/src/middleware/index.ts)

```typescript
interface AuthMiddleware {
  // Sprawdzenie sesji dla chronionych endpointów
  isAuthenticated(): Promise<boolean>;
  
  // Przekierowanie na /auth/login dla nieautoryzowanych
  redirectToLogin(): Promise<Response>;
}
```

### 2.3. Modele danych

#### User (/src/types.ts)
```typescript
interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}
```

## 3. System autentykacji

### 3.1. Integracja z Supabase Auth

#### Klient Supabase (/src/db/supabase.ts)
```typescript
interface AuthClient {
  // Podstawowe operacje auth
  signUp(email: string, password: string): Promise<AuthResponse>;
  signIn(email: string, password: string): Promise<AuthResponse>;
  signOut(): Promise<void>;
  
  // Zarządzanie sesją
  getSession(): Promise<Session | null>;
  refreshSession(): Promise<Session>;
  
  // Resetowanie hasła
  resetPassword(email: string): Promise<void>;
  updatePassword(token: string, newPassword: string): Promise<void>;
}
```

### 3.2. Zarządzanie stanem autentykacji

#### AuthProvider (/src/components/auth/AuthProvider.tsx)
- Kontekst React przechowujący stan autentykacji
- Automatyczne odświeżanie sesji
- Synchronizacja stanu między zakładkami

#### AuthStore (/src/lib/auth-store.ts)
```typescript
interface AuthStore {
  // Zarządzanie sesją w localStorage
  saveSession(session: Session): void;
  getSession(): Session | null;
  clearSession(): void;
}
```

### 3.3. Bezpieczeństwo

- Szyfrowanie SSL/TLS dla wszystkich połączeń
- Automatyczne wygasanie sesji po czasie
- Limity prób logowania
- Walidacja siły hasła
- Bezpieczne przechowywanie tokenów
- Sanityzacja danych wejściowych
- Ochrona przed CSRF
- Brak integracji z zewnętrznymi serwisami logowania

### 3.4. Integracja z istniejącą funkcjonalnością

#### Lokalne zestawy fiszek
- Zachowanie dostępu do lokalnych zestawów dla niezalogowanych
- Możliwość przeniesienia lokalnych zestawów do konta po zalogowaniu

#### Generowanie fiszek AI
- Blokada dostępu dla niezalogowanych użytkowników
- Przekierowanie na stronę logowania z komunikatem wyjaśniającym konieczność zalogowania

#### Ręczne tworzenie fiszek
- Dostępne dla wszystkich użytkowników
- Automatyczny wybór miejsca zapisu:
  - Dla zalogowanych: baza danych
  - Dla niezalogowanych: localStorage 