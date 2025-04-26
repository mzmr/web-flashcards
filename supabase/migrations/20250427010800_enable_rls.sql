-- Migracja: Przywrócenie RLS dla wszystkich tabel
-- Opis: Włącza z powrotem Row Level Security dla tabel card_sets, cards, generations i generation_errors
-- Data: 2025-04-27

-- Włączenie RLS dla wszystkich tabel
alter table card_sets enable row level security;
alter table cards enable row level security;
alter table generations enable row level security;
alter table generation_errors enable row level security;