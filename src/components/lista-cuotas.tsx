// src/components/lista-cuotas.tsx
"use client";

import { useState, useTransition } from "react";
import { Receipt, Trash2 } from "lucide-react";
import { borrarGasto } from "@/app/(app)/_actions/gastos";
import { enPesos } from "@/lib/formato";
import { faltaPagar } from "@/lib/resumen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vacio } from "@/components/vacio";

export type GastoTarjeta = {
  id: string;
  descripcion: string;
  monto: number | string;
  fecha_compra: string | null;
  es_propio: boolean;
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

export function ListaCuotas({
  gastos,
  tarjeta,
}: {
  gastos: GastoTarjeta[];
  tarjeta: string;
}) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();

  if (!gastos.length) {
    return (
      <Vacio
        icono={Receipt}
        titulo="Todavía no cargaste gastos en esta tarjeta"
        detalle="Cargalos a mano o subí el PDF del resumen y se cargan solos."
      />
    );
  }

  return (
    <>
      {error && <p className="pb-2 text-sm text-gasto">{error}</p>}

      <ul className="divide-y divide-border">
        {gastos.map((g) => {
          const pendienteDePago = faltaPagar(g);

          return (
            <li key={g.id} className="flex items-center gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{g.descripcion}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {g.fecha_compra
                    ? `Comprado ${enDDMMAAAA(g.fecha_compra)} · ${tarjeta}`
                    : tarjeta}
                  {!g.es_propio && " · de un tercero"}
                </p>
              </div>

              {g.cuotas_total && g.cuota_actual ? (
                <div className="hidden w-28 shrink-0 sm:block">
                  <p className="text-xs text-muted-foreground">
                    cuota {g.cuota_actual}/{g.cuotas_total}
                  </p>
                  <div className="mt-1">
                    <Pips actual={g.cuota_actual} total={g.cuotas_total} />
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
                    <p className="tabular-nums">{enPesos(pendienteDePago)}</p>
                  </>
                )}
              </div>

              <p className="w-28 shrink-0 text-right font-semibold tabular-nums text-gasto">
                {enPesos(Number(g.monto))}
              </p>

              <Button
                variant="ghost"
                size="icon"
                aria-label={`Borrar ${g.descripcion}`}
                disabled={pendiente}
                onClick={() =>
                  iniciar(async () => setError((await borrarGasto(g.id)).error))
                }
              >
                <Trash2 className="text-gasto" />
              </Button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
