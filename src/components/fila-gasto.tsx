// src/components/fila-gasto.tsx
"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { borrarGasto, cambiarTitular } from "@/app/(app)/_actions/gastos";
import { enPesos } from "@/lib/formato";
import { faltaPagar } from "@/lib/resumen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type GastoTarjeta = {
  id: string;
  descripcion: string;
  monto: number | string;
  fecha: string;
  fecha_compra: string | null;
  es_propio: boolean;
  pagado: boolean;
  cuota_actual: number | null;
  cuotas_total: number | null;
};

const enDDMMAAAA = (iso: string) => iso.split("-").reverse().join("/");

/** Puntos de avance: llenos los pagados, vacíos los que faltan. */
function Pips({ actual, total }: { actual: number; total: number }) {
  // Arriba de 12 cuotas los puntos dejan de leerse: se cae a una barra.
  if (total > 12) {
    return (
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(actual / total) * 100}%` }}
        />
      </div>
    );
  }

  return (
    <div className="flex gap-1" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`size-1.5 rounded-full ${i < actual ? "bg-primary" : "bg-white/20"}`}
        />
      ))}
    </div>
  );
}

/** Un consumo de la tarjeta, con el titular editable en el mismo lugar. */
export function FilaGasto({
  gasto,
  tarjeta,
  onError,
}: {
  gasto: GastoTarjeta;
  tarjeta: string;
  onError: (error?: string) => void;
}) {
  const [pendiente, iniciar] = useTransition();
  const pendienteDePago = faltaPagar(gasto);

  return (
    <li className="flex items-center gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{gasto.descripcion}</p>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {gasto.fecha_compra
              ? `Comprado ${enDDMMAAAA(gasto.fecha_compra)} · ${tarjeta}`
              : tarjeta}
          </span>
          <Badge
            asChild
            variant={gasto.es_propio ? "outline" : "secondary"}
            className="cursor-pointer hover:bg-muted"
          >
            <button
              type="button"
              disabled={pendiente}
              title="Cambiar de quién es este gasto"
              onClick={() =>
                iniciar(async () =>
                  onError((await cambiarTitular(gasto.id, !gasto.es_propio)).error),
                )
              }
            >
              {gasto.es_propio ? "Propio" : "De un tercero"}
            </button>
          </Badge>
        </p>
      </div>

      {gasto.cuotas_total && gasto.cuota_actual ? (
        <div className="hidden w-28 shrink-0 sm:block">
          <p className="text-xs text-muted-foreground">
            cuota {gasto.cuota_actual}/{gasto.cuotas_total}
          </p>
          <div className="mt-1">
            <Pips actual={gasto.cuota_actual} total={gasto.cuotas_total} />
          </div>
        </div>
      ) : (
        <div className="hidden w-28 shrink-0 sm:block">
          <Badge variant="outline">un pago</Badge>
        </div>
      )}

      <div className="hidden w-32 shrink-0 text-right sm:block">
        {pendienteDePago !== null && pendienteDePago > 0 && (
          <>
            <p className="text-xs text-muted-foreground">Falta pagar</p>
            <p className="monto tabular-nums">{enPesos(pendienteDePago)}</p>
          </>
        )}
      </div>

      <p className="monto w-28 shrink-0 text-right font-semibold tabular-nums text-gasto">
        {enPesos(Number(gasto.monto))}
      </p>

      <Button
        variant="ghost"
        size="icon"
        aria-label={`Borrar ${gasto.descripcion}`}
        disabled={pendiente}
        onClick={() => iniciar(async () => onError((await borrarGasto(gasto.id)).error))}
      >
        <Trash2 className="text-gasto" />
      </Button>
    </li>
  );
}
