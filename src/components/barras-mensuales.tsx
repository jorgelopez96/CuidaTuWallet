// src/components/barras-mensuales.tsx
"use client";

import { motion } from "motion/react";

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-08" → "ago" */
const nombreDeMes = (clave: string) => MESES[Number(clave.slice(5, 7)) - 1];

/** Corto para el eje: 1.485.000 → "1,49 M". Debajo del millón, en miles. */
function abreviado(monto: number) {
  if (Math.abs(monto) >= 1_000_000) {
    return `${(monto / 1_000_000).toFixed(2).replace(".", ",")} M`;
  }
  return `${Math.round(monto / 1000)} k`;
}

export function BarrasMensuales({
  serie,
}: {
  serie: { mes: string; monto: number }[];
}) {
  const techo = Math.max(...serie.map((m) => m.monto), 1);

  if (techo === 1) {
    return (
      <p className="flex h-48 items-center justify-center text-center text-sm text-muted-foreground">
        Cuando cargues un resumen con cuotas vas a ver acá cuánto te queda
        comprometido cada mes.
      </p>
    );
  }

  return (
    <div className="flex h-48 items-stretch gap-2">
      {serie.map(({ mes, monto }, i) => {
        const actual = i === 0;
        const alto = Math.max(4, (monto / techo) * 100);

        return (
          <div key={mes} className="flex h-full flex-1 flex-col items-center gap-2">
            <span className="monto text-xs tabular-nums text-muted-foreground">
              {monto === 0 ? "—" : abreviado(monto)}
            </span>

            <div className="flex min-h-0 w-full flex-1 items-end">
              <motion.div
                className={`w-full rounded-t-lg ${
                  actual ? "bg-gradient-to-t from-emerald-500 to-primary" : "bg-primary/45"
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${alto}%` }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              />
            </div>

            <span
              className={`text-xs ${actual ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {nombreDeMes(mes)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
