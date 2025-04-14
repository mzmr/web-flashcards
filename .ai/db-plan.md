# Schemat bazy danych - Web Flashcards

## 1. Tabele

### 1.1. users

Ta tabela jest zarządzana przez Supabase Auth

- `id`: UUID, PRIMARY KEY
- `email`: VARCHAR(255), NOT NULL, UNIQUE
- `encrypted_password`: VARCHAR(255), NOT NULL
- `created_at`: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()
- `confirmed_at`: TIMESTAMPTZ

### 1.2. card_sets

- `id`: UUID, PRIMARY KEY
- `user_id`: UUID, NOT NULL, REFERENCES `users(id)` ON DELETE CASCADE
- `name`: VARCHAR(100), NOT NULL
- `created_at`: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()

### 1.3. cards

- `id`: UUID, PRIMARY KEY
- `card_set_id`: UUID, NOT NULL, REFERENCES `card_sets(id)` ON DELETE CASCADE
- `generation_id`: UUID, NULLABLE, REFERENCES `generations(id)` ON DELETE SET NULL
- `front`: VARCHAR(300), NOT NULL
- `back`: VARCHAR(300), NOT NULL
- `source`: card_source, NOT NULL
  > Możliwości: 'ai_generated', 'ai_edited', 'user_created'. Zaleca się utworzenie typu ENUM:  
  > `CREATE TYPE card_source AS ENUM ('ai_generated', 'ai_edited', 'user_created');`
- `created_at`: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()

### 1.4. generations

- `id`: UUID, PRIMARY KEY
- `input_text`: TEXT, NOT NULL
- `duration`: INT, NOT NULL, CHECK (duration >= 0)
- `generated_count`: INT, NOT NULL, CHECK (generated_count >= 0)
- `accepted_unedited_count`: INT, NULLABLE, CHECK (accepted_unedited_count >= 0)
- `accepted_edited_count`: INT, NULLABLE, CHECK (accepted_edited_count >= 0)
- `model`: VARCHAR(100), NOT NULL
- `user_id`: UUID, NOT NULL, REFERENCES `users(id)` ON DELETE CASCADE
- `created_at`: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()
- `updated_at`: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()

### 1.5. generation_errors

- `id`: UUID, PRIMARY KEY
- `user_id`: UUID, NOT NULL, REFERENCES `users(id)` ON DELETE CASCADE
- `model`: VARCHAR(100), NOT NULL
- `input_text`: TEXT
- `error_code`: VARCHAR(50), NOT NULL
- `error_message`: TEXT, NOT NULL
- `created_at`: TIMESTAMPTZ, NOT NULL, DEFAULT NOW()

## 2. Relacje między tabelami

- `users` (1) ← (N) `card_sets`
- `card_sets` (1) ← (N) `cards`
- `users` (1) ← (N) `generations`
- `generations` (1) ← (N) `cards`
- `users` (1) ← (N) `generation_errors`

## 3. Indeksy

- W tabeli `card_sets`:
  - Indeks na kolumnie `user_id`
  - Indeks na kolumnie `created_at`
- W tabeli `cards`:
  - Indeks na kolumnie `card_set_id`
  - Indeks na kolumnie `generation_id`
  - Indeksy pg_trgm na kolumnach `front` oraz `back`:
    - `CREATE INDEX idx_cards_front_trgm ON cards USING gin (front gin_trgm_ops);`
    - `CREATE INDEX idx_cards_back_trgm ON cards USING gin (back gin_trgm_ops);`
- W tabeli `generations`:
  - Indeks na kolumnie `user_id`
- W tabeli `generation_errors`:
  - Indeks na kolumnie `user_id`

## 4. Zasady PostgreSQL (RLS)

We wszystkich tabelach `card_sets`, `cards`, `generations` oraz `generation_errors` wdrożone zostaną zasady Row-Level Security (RLS) oparte na kolumnie `user_id`, co zapewni, że użytkownicy mają dostęp jedynie do własnych danych.

## 5. Dodatkowe uwagi

- Zastosowanie indeksów, w tym indeksów pg_trgm dla kolumn `front` oraz `back` w tabeli `cards`, ma na celu optymalizację wydajności zapytań wyszukiwania podłańcuchowego.
