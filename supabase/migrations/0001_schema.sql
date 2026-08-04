-- supabase/migrations/0001_schema.sql

create table tarjetas (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.jwt() ->> 'sub',
  marca text not null,
  banco text,
  ultimos4 text not null check (ultimos4 ~ '^[0-9]{4}$'),
  created_at timestamptz not null default now()
);

create table ingresos (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.jwt() ->> 'sub',
  concepto text not null,
  monto numeric(14, 2) not null check (monto > 0),
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

create table gastos (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default auth.jwt() ->> 'sub',
  tarjeta_id uuid references tarjetas (id) on delete cascade,
  descripcion text not null,
  categoria text,
  monto numeric(14, 2) not null check (monto > 0),
  fecha date not null default current_date,
  medio_pago text not null check (
    medio_pago in ('efectivo', 'debito', 'transferencia', 'credito')
  ),
  es_propio boolean not null default true,
  cuota_actual smallint,
  cuotas_total smallint,
  created_at timestamptz not null default now(),
  constraint credito_requiere_tarjeta check (
    (medio_pago = 'credito') = (tarjeta_id is not null)
  ),
  constraint cuotas_coherentes check (
    (cuota_actual is null and cuotas_total is null)
    or (cuota_actual between 1 and cuotas_total)
  )
);

create index on tarjetas (user_id);
create index on ingresos (user_id, fecha desc);
create index on gastos (user_id, fecha desc);
create index on gastos (tarjeta_id);

alter table tarjetas enable row level security;
alter table ingresos enable row level security;
alter table gastos enable row level security;

create policy propias on tarjetas for all to authenticated
  using (user_id = auth.jwt() ->> 'sub')
  with check (user_id = auth.jwt() ->> 'sub');

create policy propios on ingresos for all to authenticated
  using (user_id = auth.jwt() ->> 'sub')
  with check (user_id = auth.jwt() ->> 'sub');

create policy propios on gastos for all to authenticated
  using (user_id = auth.jwt() ->> 'sub')
  with check (user_id = auth.jwt() ->> 'sub');
