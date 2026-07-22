-- supabase/schema.sql
-- Esquema completo para CuidaTuWallet (migración desde Firestore).
-- Correr una sola vez en el SQL Editor de Supabase, en orden de arriba hacia abajo.

-- ============================================================
-- Tablas
-- ============================================================

-- Perfil. El id es el user id de Clerk (texto, no uuid).
create table profiles (
  id          text primary key,
  name        text not null,
  birthdate   date,
  email       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table incomes (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references profiles(id) on delete cascade,
  description   text not null,
  amount        numeric(12,2) not null check (amount > 0),
  type          text not null check (type in ('salary','other')),
  month         text not null,                    -- 'YYYY-MM'
  pay_day       int check (pay_day between 1 and 31),
  expires_month text,                             -- 'YYYY-MM'
  is_archived   boolean not null default false,
  created_at    timestamptz not null default now()
);

create table expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references profiles(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null check (amount > 0),
  category    text not null,
  date        date not null,
  created_at  timestamptz not null default now()
);

create table credit_cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references profiles(id) on delete cascade,
  alias       text not null,
  type        text not null,
  last_four   text not null check (char_length(last_four) = 4),
  closing_day int  not null check (closing_day between 1 and 31),
  created_at  timestamptz not null default now()
);

create table card_expenses (
  id                 uuid primary key default gen_random_uuid(),
  user_id            text not null references profiles(id) on delete cascade,
  card_id            uuid not null references credit_cards(id) on delete cascade,
  description        text not null,
  total_amount       numeric(12,2) not null check (total_amount > 0),
  total_installments int not null check (total_installments >= 1),
  paid_installments  int not null default 0 check (paid_installments >= 0),
  date               date not null,
  created_at         timestamptz not null default now(),

  -- Derivados: los calcula Postgres, no la app
  current_installment_amount numeric(12,2)
    generated always as (total_amount / total_installments) stored,
  remaining_installments int
    generated always as (total_installments - paid_installments) stored,

  constraint paid_lt_total check (paid_installments < total_installments)
);

-- ============================================================
-- Índices
-- ============================================================

create index on incomes       (user_id, is_archived);
create index on expenses      (user_id, date desc);
create index on credit_cards  (user_id);
create index on card_expenses (user_id, card_id);

-- ============================================================
-- Row Level Security
-- ============================================================
-- Con Clerk como Third-Party Auth provider, auth.jwt() ->> 'sub' devuelve
-- el user id de Clerk. El (select ...) alrededor de auth.jwt() no es
-- cosmético: hace que Postgres evalúe la expresión una sola vez por query
-- en lugar de una vez por fila.

alter table profiles enable row level security;

create policy "own profile"
  on profiles for all
  using      (id = (select auth.jwt() ->> 'sub'))
  with check (id = (select auth.jwt() ->> 'sub'));

alter table incomes enable row level security;

create policy "own rows"
  on incomes for all
  using      (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));

alter table expenses enable row level security;

create policy "own rows"
  on expenses for all
  using      (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));

alter table credit_cards enable row level security;

create policy "own rows"
  on credit_cards for all
  using      (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));

alter table card_expenses enable row level security;

create policy "own rows"
  on card_expenses for all
  using      (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));
