-- Migracja: Aktualizacja schematu bazy danych dla Web Flashcards - dodanie generation_id do tabeli cards oraz usunięcie card_set_id z tabeli generations
-- Opis: Dodaje kolumnę generation_id do tabeli cards z kluczem obcym i indeksem (ON DELETE SET NULL), a następnie usuwa kolumnę card_set_id z tabeli generations wraz z powiązanym indeksem.
-- Data: 2025-04-15

-- 1. Dodaj kolumnę generation_id do tabeli cards
ALTER TABLE cards
ADD COLUMN generation_id UUID REFERENCES generations(id) ON DELETE SET NULL;

-- 2. Dodaj indeks na nowej kolumnie generation_id
CREATE INDEX idx_cards_generation_id ON cards(generation_id);

-- 3. Usuń indeks na card_set_id z tabeli generations (jeśli istnieje)
DROP INDEX IF EXISTS idx_generations_card_set_id;

-- 4. Usuń kolumnę card_set_id z tabeli generations
ALTER TABLE generations
DROP COLUMN card_set_id; 