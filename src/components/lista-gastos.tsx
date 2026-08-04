// src/components/lista-gastos.tsx
"use client";

import { useState, useTransition } from "react";
import { Receipt, Trash2 } from "lucide-react";
import { borrarGasto } from "@/app/(app)/_actions/gastos";
import { enPesos } from "@/lib/formato";
import { agruparPorDia, total } from "@/lib/resumen";
import { NOMBRE_MEDIO, type Medio } from "@/lib/catalogos";
import { IconoCategoria } from "@/components/categorias";
import { Vacio } from "@/components/vacio";
import { Button } from "@/components/ui/button";

export type Gasto = {
  id: string;
  descripcion: string;
  categoria: string | null;
  monto: number | string;
  fecha: string;
  es_propio: boolean;
  medio_pago: Medio;
  cuota_actual: number | null;
  cuotas_total: number | null;
};

const POR_TANDA = 12;

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "hoy", "ayer" o "sáb 1 ago". Las fechas vienen en ISO, sin zona horaria. */
function tituloDeDia(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  const fecha = new Date(a, m - 1, d);

  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const dias = Math.round((hoy.getTime() - fecha.getTime()) / 86_400_000);

  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  return `${DIAS[fecha.getDay()]} ${d} ${MESES[m - 1]}`;
}

export function ListaGastos({
  gastos,
  vacio = "Todavía no cargaste gastos.",
}: {
  gastos: Gasto[];
  vacio?: string;
}) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();
  const [tandas, setTandas] = useState(1);

  if (!gastos.length) return <Vacio icono={Receipt} titulo={vacio} />;

  const visibles = gastos.slice(0, tandas * POR_TANDA);

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-gasto">{error}</p>}

      {agruparPorDia(visibles).map(({ fecha, gastos: delDia }) => (
        <div key={fecha}>
          <div className="flex items-center justify-between rounded-lg bg-accent/60 px-3 py-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide">
              {tituloDeDia(fecha)}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {enPesos(total(delDia))}
            </span>
          </div>

          <ul className="divide-y divide-border">
            {delDia.map((g) => (
              <li key={g.id} className="flex items-center gap-3 py-2.5">
                <IconoCategoria categoria={g.categoria} />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{g.descripcion}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {g.categoria?.trim() || "Otros"}
                    {g.cuotas_total && ` · cuota ${g.cuota_actual}/${g.cuotas_total}`}
                  </p>
                </div>

                <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
                  {NOMBRE_MEDIO[g.medio_pago]}
                </span>

                <span className="w-28 shrink-0 text-right font-semibold tabular-nums text-gasto">
                  {enPesos(Number(g.monto))}
                </span>

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
            ))}
          </ul>
        </div>
      ))}

      {visibles.length < gastos.length && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Mostrando {visibles.length} de {gastos.length}
          </span>
          <Button variant="outline" onClick={() => setTandas((t) => t + 1)}>
            Ver más
          </Button>
        </div>
      )}
    </div>
  );
}
