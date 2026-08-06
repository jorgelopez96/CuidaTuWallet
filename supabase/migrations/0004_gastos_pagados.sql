-- supabase/migrations/0004_gastos_pagados.sql
-- Un resumen de tarjeta se carga antes de pagarlo: hasta que no lo pagás no
-- descuenta del disponible del mes. Los gastos que ya existen quedan pagados,
-- que es como los venía contando la app.

alter table gastos add column pagado boolean not null default true;

comment on column gastos.pagado is 'Falso mientras el resumen de la tarjeta esté impago: no descuenta del disponible';
