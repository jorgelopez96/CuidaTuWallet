// src/components/ecuacion-del-mes.tsx
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MontoAnimado } from "@/components/monto-animado";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "2026-07" → "julio" */
const nombreDeMes = (clave: string) => MESES[Number(clave.slice(5, 7)) - 1];

/**
 * Lo que entró menos lo que salió da el disponible. La resta va explícita
 * porque es la única cuenta que hace la app y conviene que se lea.
 */
export function EcuacionDelMes({
  cobrado,
  gastado,
  disponible,
  cantidadIngresos,
  cantidadGastos,
  cambio,
  mesAnterior,
}: {
  cobrado: number;
  gastado: number;
  disponible: number;
  cantidadIngresos: number;
  cantidadGastos: number;
  cambio: number | null;
  mesAnterior?: string;
}) {
  return (
    <Card className="elevable">
      <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-6">
        <div>
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            <TrendingUp className="size-3.5 text-ingreso" />
            Entró
          </p>
          <MontoAnimado
            valor={cobrado}
            className="block text-2xl font-semibold text-ingreso"
          />
          <p className="text-xs text-muted-foreground">
            {cantidadIngresos} ingreso{cantidadIngresos === 1 ? "" : "s"}
          </p>
        </div>

        <span aria-hidden className="text-2xl text-muted-foreground">−</span>

        <div>
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
            <TrendingDown className="size-3.5 text-gasto" />
            Salió
          </p>
          <MontoAnimado
            valor={gastado}
            className="block text-2xl font-semibold text-gasto"
          />
          <p className="text-xs text-muted-foreground">
            {cantidadGastos} gasto{cantidadGastos === 1 ? "" : "s"}
          </p>
        </div>

        <span aria-hidden className="text-2xl text-muted-foreground">=</span>

        <div className="ml-auto text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Disponible
          </p>
          <MontoAnimado
            valor={disponible}
            className="block text-4xl font-bold tracking-tight"
          />
          {cambio !== null && mesAnterior && (
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                cambio >= 0 ? "bg-ingreso/15 text-ingreso" : "bg-gasto/15 text-gasto"
              }`}
            >
              {cambio >= 0 ? "▲" : "▼"} {Math.abs(Math.round(cambio))}% vs.{" "}
              {nombreDeMes(mesAnterior)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
