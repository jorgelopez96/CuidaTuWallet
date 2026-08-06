// src/components/resumen-preview.tsx
"use client";

import { AlertTriangle } from "lucide-react";
import { enPesos } from "@/lib/formato";
import type { ResumenLeido } from "@/lib/resumen-parser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResumenPreview({
  leido,
  ultimos4Tarjeta,
  vencimiento,
  onVencimiento,
}: {
  leido: ResumenLeido;
  ultimos4Tarjeta: string;
  vencimiento: string;
  onVencimiento: (v: string) => void;
}) {
  const { gastos, ultimos4 } = leido;
  const suma = gastos.reduce((t, g) => t + g.monto, 0);
  const otraTarjeta = ultimos4 && ultimos4 !== ultimos4Tarjeta;

  return (
    <>
      {otraTarjeta && (
        <p className="flex items-start gap-2 rounded-md border border-gasto/40 bg-gasto/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gasto" />
          <span>
            Este resumen es de la tarjeta <strong>••••{ultimos4}</strong>, pero estás
            parado en la <strong>••••{ultimos4Tarjeta}</strong>. Si seguís, los gastos
            se cargan igual en esta.
          </span>
        </p>
      )}

      <p className="text-sm">
        Encontré <strong>{gastos.length}</strong> consumos por{" "}
        <strong className="tabular-nums">{enPesos(suma)}</strong>. Revisalos antes de
        guardar.
      </p>

      <div className="max-h-64 overflow-y-auto rounded-md border">
        <table className="w-full text-sm">
          <tbody>
            {gastos.map((g, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="whitespace-nowrap p-2 text-muted-foreground">
                  {g.fechaCompra.split("-").reverse().join("/")}
                </td>
                <td className="p-2">
                  {g.descripcion}
                  {g.cuotas_total && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      cuota {g.cuota_actual}/{g.cuotas_total}
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap p-2 text-right tabular-nums">
                  {enPesos(g.monto)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <Label htmlFor="vencimiento">Mes al que impacta</Label>
        <Input
          id="vencimiento"
          type="date"
          value={vencimiento}
          onChange={(e) => onVencimiento(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Vencimiento del resumen. Las fechas de arriba son de compra.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Entran como propios y sin pagar: no descuentan del disponible hasta que
        marques el resumen como pagado. En la lista de la tarjeta podés pasar a
        terceros los que no sean tuyos.
      </p>
    </>
  );
}
