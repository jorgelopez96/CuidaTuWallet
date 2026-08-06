// src/components/movimientos-mensuales.tsx
"use client";

import { useState } from "react";
import { PiggyBank } from "lucide-react";
import { enPesos } from "@/lib/formato";
import type { Ingreso } from "@/lib/ingresos";
import { IconoCategoria } from "@/components/categorias";
import { Vacio } from "@/components/vacio";
import { Button } from "@/components/ui/button";

/** Cuántos movimientos se ven de entrada y cuántos suma cada "Ver más". */
const PASO = 5;

export type GastoDelMes = {
  id: string;
  descripcion: string;
  categoria: string | null;
  monto: number | string;
  fecha: string;
  tarjeta_id: string | null;
  pagado: boolean;
};

type Fila = {
  id: string;
  titulo: string;
  detalle: string;
  fecha: string;
  monto: number;
  esIngreso: boolean;
  categoria: string | null;
  pagado: boolean;
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
  const [visibles, setVisibles] = useState(PASO);

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
      pagado: true,
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
      pagado: g.pagado,
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
    <>
    <ul className="divide-y divide-border">
      {filas.slice(0, visibles).map((f) => (
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
            <p className="truncate text-xs text-muted-foreground">
              {f.detalle}
              {!f.pagado && " · sin pagar"}
            </p>
          </div>

          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
            {enDia(f.fecha)}
          </span>

          <span
            className={`monto w-28 shrink-0 text-right font-semibold tabular-nums ${
              f.esIngreso ? "text-ingreso" : f.pagado ? "text-gasto" : "text-muted-foreground"
            }`}
          >
            {f.esIngreso ? "+" : "−"} {enPesos(f.monto)}
          </span>
        </li>
      ))}
    </ul>

    {visibles < filas.length && (
      <Button
        variant="ghost"
        className="mt-2 w-full"
        onClick={() => setVisibles((v) => v + PASO)}
      >
        Ver más ({filas.length - visibles})
      </Button>
    )}
    </>
  );
}
