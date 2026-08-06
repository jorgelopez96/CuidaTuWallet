// src/components/lista-cuotas.tsx
"use client";

import { useState, useTransition } from "react";
import { Check, Receipt } from "lucide-react";
import { marcarResumenPagado } from "@/app/(app)/_actions/gastos";
import { enPesos } from "@/lib/formato";
import { agruparPorDia, total } from "@/lib/resumen";
import { Button } from "@/components/ui/button";
import { FilaGasto, type GastoTarjeta } from "@/components/fila-gasto";
import { Vacio } from "@/components/vacio";

const enDDMMAAAA = (iso: string) => iso.split("-").reverse().join("/");

/**
 * Un resumen: todo lo que vence el mismo día en esta tarjeta. Se paga entero,
 * y hasta que no se paga no descuenta del disponible del mes.
 */
function Resumen({
  tarjetaId,
  vencimiento,
  gastos,
  tarjeta,
  onError,
}: {
  tarjetaId: string;
  vencimiento: string;
  gastos: GastoTarjeta[];
  tarjeta: string;
  onError: (error?: string) => void;
}) {
  const [pendiente, iniciar] = useTransition();
  const pagado = gastos.every((g) => g.pagado);

  return (
    <section>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-2">
        <div>
          <p className="text-sm font-semibold">Vence {enDDMMAAAA(vencimiento)}</p>
          <p className="text-xs text-muted-foreground">
            {gastos.length} consumo{gastos.length === 1 ? "" : "s"} ·{" "}
            <span className="monto tabular-nums">{enPesos(total(gastos))}</span>
            {!pagado && " · sin pagar, todavía no descuenta"}
          </p>
        </div>

        <Button
          size="sm"
          variant={pagado ? "ghost" : "outline"}
          disabled={pendiente}
          onClick={() =>
            iniciar(async () =>
              onError(
                (await marcarResumenPagado(tarjetaId, vencimiento, !pagado)).error,
              ),
            )
          }
        >
          {pagado ? (
            <>
              <Check className="text-ingreso" />
              Pagado
            </>
          ) : (
            "Marcar pagado"
          )}
        </Button>
      </header>

      <ul className="divide-y divide-border">
        {gastos.map((g) => (
          <FilaGasto key={g.id} gasto={g} tarjeta={tarjeta} onError={onError} />
        ))}
      </ul>
    </section>
  );
}

export function ListaCuotas({
  tarjetaId,
  gastos,
  tarjeta,
}: {
  tarjetaId: string;
  gastos: GastoTarjeta[];
  tarjeta: string;
}) {
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

      <div className="flex flex-col gap-6">
        {agruparPorDia(gastos).map(({ fecha, gastos: delResumen }) => (
          <Resumen
            key={fecha}
            tarjetaId={tarjetaId}
            vencimiento={fecha}
            gastos={delResumen}
            tarjeta={tarjeta}
            onError={setError}
          />
        ))}
      </div>
    </>
  );
}
