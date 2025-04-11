-- Migracja: Inicjalny schemat bazy danych dla Web Flashcards
-- Opis: Tworzy wszystkie wymagane tabele, typy, indeksy i polityki bezpieczeństwa
-- Data: 2025-04-11

-- Włączenie rozszerzenia pg_trgm dla wyszukiwania podobieństw tekstu
create extension if not exists pg_trgm;

-- Utworzenie typu wyliczeniowego dla źródła fiszek
create type card_source as enum ('ai_generated', 'ai_edited', 'user_created');

-- Tabela zestawów fiszek
create table card_sets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name varchar(100) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Włączenie RLS dla card_sets
alter table card_sets enable row level security;

-- Polityki RLS dla card_sets
create policy "Użytkownicy mogą wyświetlać własne zestawy" 
    on card_sets for select 
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć własne zestawy" 
    on card_sets for insert 
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować własne zestawy" 
    on card_sets for update 
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać własne zestawy" 
    on card_sets for delete 
    using (auth.uid() = user_id);

-- Indeksy dla card_sets
create index idx_card_sets_user_id on card_sets(user_id);
create index idx_card_sets_created_at on card_sets(created_at);

-- Tabela fiszek
create table cards (
    id uuid primary key default gen_random_uuid(),
    card_set_id uuid not null references card_sets(id) on delete cascade,
    front varchar(300) not null,
    back varchar(300) not null,
    source card_source not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Włączenie RLS dla cards
alter table cards enable row level security;

-- Polityki RLS dla cards
create policy "Użytkownicy mogą wyświetlać fiszki z własnych zestawów" 
    on cards for select 
    using (exists (
        select 1 from card_sets 
        where card_sets.id = cards.card_set_id 
        and card_sets.user_id = auth.uid()
    ));

create policy "Użytkownicy mogą tworzyć fiszki we własnych zestawach" 
    on cards for insert 
    with check (exists (
        select 1 from card_sets 
        where card_sets.id = cards.card_set_id 
        and card_sets.user_id = auth.uid()
    ));

create policy "Użytkownicy mogą aktualizować fiszki z własnych zestawów" 
    on cards for update 
    using (exists (
        select 1 from card_sets 
        where card_sets.id = cards.card_set_id 
        and card_sets.user_id = auth.uid()
    ));

create policy "Użytkownicy mogą usuwać fiszki z własnych zestawów" 
    on cards for delete 
    using (exists (
        select 1 from card_sets 
        where card_sets.id = cards.card_set_id 
        and card_sets.user_id = auth.uid()
    ));

-- Indeksy dla cards
create index idx_cards_card_set_id on cards(card_set_id);
create index idx_cards_front_trgm on cards using gin (front gin_trgm_ops);
create index idx_cards_back_trgm on cards using gin (back gin_trgm_ops);

-- Tabela generacji
create table generations (
    id uuid primary key default gen_random_uuid(),
    input_text text not null,
    duration int not null check (duration >= 0),
    generated_count int not null check (generated_count >= 0),
    accepted_unedited_count int check (accepted_unedited_count >= 0),
    accepted_edited_count int check (accepted_edited_count >= 0),
    model varchar(100) not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    card_set_id uuid not null references card_sets(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Włączenie RLS dla generations
alter table generations enable row level security;

-- Polityki RLS dla generations
create policy "Użytkownicy mogą wyświetlać własne generacje" 
    on generations for select 
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć własne generacje" 
    on generations for insert 
    with check (auth.uid() = user_id);

create policy "Użytkownicy mogą aktualizować własne generacje" 
    on generations for update 
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą usuwać własne generacje" 
    on generations for delete 
    using (auth.uid() = user_id);

-- Indeksy dla generations
create index idx_generations_user_id on generations(user_id);
create index idx_generations_card_set_id on generations(card_set_id);

-- Tabela błędów generacji
create table generation_errors (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar(100) not null,
    input_text text,
    error_code varchar(50) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Włączenie RLS dla generation_errors
alter table generation_errors enable row level security;

-- Polityki RLS dla generation_errors
create policy "Użytkownicy mogą wyświetlać własne błędy generacji" 
    on generation_errors for select 
    using (auth.uid() = user_id);

create policy "Użytkownicy mogą tworzyć wpisy o własnych błędach generacji" 
    on generation_errors for insert 
    with check (auth.uid() = user_id);

-- Indeks dla generation_errors
create index idx_generation_errors_user_id on generation_errors(user_id);

-- Triggery dla automatycznej aktualizacji updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_card_sets_updated_at
    before update on card_sets
    for each row
    execute function update_updated_at_column();

create trigger update_cards_updated_at
    before update on cards
    for each row
    execute function update_updated_at_column();

create trigger update_generations_updated_at
    before update on generations
    for each row
    execute function update_updated_at_column();
