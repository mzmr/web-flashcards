-- Migracja: Wyłączenie RLS dla wszystkich tabel
-- Opis: Wyłącza Row Level Security dla tabel card_sets, cards, generations i generation_errors
-- Data: 2025-04-12

-- Wyłączenie RLS dla card_sets
alter table card_sets disable row level security;

-- Wyłączenie RLS dla cards
alter table cards disable row level security;

-- Wyłączenie RLS dla generations
alter table generations disable row level security;

-- Wyłączenie RLS dla generation_errors
alter table generation_errors disable row level security; 