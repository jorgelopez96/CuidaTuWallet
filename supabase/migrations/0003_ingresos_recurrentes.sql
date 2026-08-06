-- supabase/migrations/0003_ingresos_recurrentes.sql
-- Un ingreso recurrente (sueldo, alquiler que cobrás) se cuenta en todos los
-- meses entre su alta y su baja, sin generar una fila por mes. Los ingresos
-- que ya existen quedan como puntuales: mismo comportamiento que hasta ahora.

alter table ingresos
  add column recurrente boolean not null default false,
  add column baja_el date;

alter table ingresos add constraint baja_posterior_al_alta
  check (baja_el is null or baja_el >= fecha);

alter table ingresos add constraint baja_solo_si_recurrente
  check (baja_el is null or recurrente);

comment on column ingresos.recurrente is 'Se cobra todos los meses desde `fecha` hasta `baja_el`';
comment on column ingresos.baja_el is 'Fecha en que dejó de cobrarse; null = sigue vigente';
