-- supabase/migrations/0002_fecha_compra.sql
-- En un resumen, `fecha` es el mes que impacta (el vencimiento) y `fecha_compra`
-- es cuándo se hizo la compra original. Para un gasto suelto son la misma cosa,
-- así que queda null.

alter table gastos add column fecha_compra date;

comment on column gastos.fecha is 'Mes al que imputa el gasto (vencimiento del resumen, si vino de uno)';
comment on column gastos.fecha_compra is 'Fecha real de la compra; solo para cuotas importadas de un resumen';
