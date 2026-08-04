// src/components/barras-mensuales.tsx
"use client";

import { motion } from "motion/react";
import { enPesos } from "@/lib/formato";

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
  serie: { mes: string; disponible: number }[];
}) {
  // Escala sobre el valor absoluto: un mes en rojo también tiene que verse.
  const techo = Math.max(...serie.map((m) => Math.abs(m.disponible)), 1);

  return (
    <div className="flex h-48 items-stretch gap-2">
      {serie.map(({ mes, disponible }, i) => {
        const actual = i === serie.length - 1;
        const alto = Math.max(4, (Math.abs(disponible) / techo) * 100);

        return (
          <div key={mes} className="flex h-full flex-1 flex-col items-center gap-2">
            <span className="text-xs tabular-nums text-muted-foreground">
              {disponible === 0 ? "—" : abreviado(disponible)}
            </span>

            <div className="flex min-h-0 w-full flex-1 items-end">
              <motion.div
                className={`w-full rounded-t-lg ${
                  disponible < 0
                    ? "bg-gasto/60"
                    : actual
                      ? "bg-gradient-to-t from-emerald-500 to-primary"
                      : "bg-primary/45"
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${alto}%` }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                title={enPesos(disponible)}
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
