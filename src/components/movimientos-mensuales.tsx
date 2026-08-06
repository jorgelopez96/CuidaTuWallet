// src/components/movimientos-mensuales.tsx
import { PiggyBank } from "lucide-react";
import { enPesos } from "@/lib/formato";
import type { Ingreso } from "@/lib/ingresos";
import { IconoCategoria } from "@/components/categorias";
import { Vacio } from "@/components/vacio";

export type GastoDelMes = {
  id: string;
  descripcion: string;
  categoria: string | null;
  monto: number | string;
  fecha: string;
  tarjeta_id: string | null;
};

type Fila = {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string;
  monto: number;
  esIngreso: boolean;
  categoria: string | null;
};

const enDia = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/**
 * Todo lo que pasó en el mes, ingresos y gastos juntos, del más reciente al más
 * viejo. Es solo lectura: se carga desde Ingresos, Consumos y Tarjetas.
 */
export function MovimientosMensuales({
  ingresos,
  gastos,
  tarjetas,
}: {
  ingresos: Ingreso[];
  gastos: GastoDelMes[];
  tarjetas: { id: string; marca: string; banco: string | null; ultimos4: string }[];
}) {
  const nombreDeTarjeta = new Map(
    tarjetas.map((t) => [t.id, `${t.banco ?? t.marca} ····${t.ultimos4}`]),
  );

  const filas: Fila[] = [
    ...ingresos.map((i) => ({
      id: `ingreso-${i.id}`,
      titulo: i.concepto,
      detalle: i.recurrente ? "Ingreso mensual" : "Ingreso",
      fecha: i.fecha,
      monto: Number(i.monto),
      esIngreso: true,
      categoria: null,
    })),
    ...gastos.map((g) => ({
      id: `gasto-${g.id}`,
      titulo: g.descripcion,
      detalle:
        (g.tarjeta_id && nombreDeTarjeta.get(g.tarjeta_id)) ||
        g.categoria?.trim() ||
        "Otros",
      fecha: g.fecha,
      monto: Number(g.monto),
      esIngreso: false,
      categoria: g.categoria,
    })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha));

  if (!filas.length) {
    return (
      <Vacio
        icono={PiggyBank}
        titulo="Sin movimientos este mes"
        detalle="Cargá un ingreso en Ingresos o un gasto en Consumos y van a aparecer acá."
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {filas.map((f) => (
        <li key={f.id} className="flex items-center gap-3 py-2.5">
          {f.esIngreso ? (
            <span
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ingreso/15 text-ingreso"
            >
              <PiggyBank className="size-4" />
            </span>
          ) : (
            <IconoCategoria categoria={f.categoria} />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{f.titulo}</p>
            <p className="truncate text-xs text-muted-foreground">{f.detalle}</p>
          </div>

          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {enDia(f.fecha)}
          </span>

          <span
            className={`w-28 shrink-0 text-right font-semibold tabular-nums ${
              f.esIngreso ? "text-ingreso" : "text-gasto"
            }`}
          >
            {f.esIngreso ? "+" : "−"} {enPesos(f.monto)}
          </span>
        </li>
      ))}
    </ul>
  );
}
