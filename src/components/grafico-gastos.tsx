// src/components/grafico-gastos.tsx
"use client";

import { Cell, Pie, PieChart } from "recharts";
import { PieChart as IconoTorta } from "lucide-react";
import { enPesos } from "@/lib/formato";
import { estiloDeCategoria } from "@/components/categorias";
import { Vacio } from "@/components/vacio";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type Dato = { categoria: string; monto: number };

export function GraficoGastos({ datos }: { datos: Dato[] }) {
  if (!datos.length) {
    return (
      <Vacio
        icono={IconoTorta}
        titulo="Sin gastos todavía"
        detalle="Cuando cargues el primero vas a ver acá cómo se reparte tu plata."
      />
    );
  }

  const total = datos.reduce((t, d) => t + d.monto, 0);
  const config: ChartConfig = Object.fromEntries(
    datos.map(({ categoria }) => [
      categoria,
      { label: categoria, color: estiloDeCategoria(categoria).color },
    ]),
  );

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      {/* El total va como HTML encima del SVG: el <Label> de Recharts no rinde. */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="monto text-lg font-semibold tabular-nums">{enPesos(total)}</span>
          <span className="text-xs text-muted-foreground">este mes</span>
        </div>

        <ChartContainer config={config} className="aspect-square h-56">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="categoria"
                formatter={(valor) => (
                  <span className="monto">{enPesos(Number(valor))}</span>
                )}
              />
            }
          />
          <Pie data={datos} dataKey="monto" nameKey="categoria" innerRadius={62} strokeWidth={3}>
            {datos.map(({ categoria }) => (
              <Cell
                key={categoria}
                fill={estiloDeCategoria(categoria).color}
                stroke="var(--card)"
              />
            ))}
          </Pie>
        </PieChart>
        </ChartContainer>
      </div>

      <ul className="flex w-full flex-col gap-2 text-sm">
        {datos.map(({ categoria, monto }) => (
          <li key={categoria} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: estiloDeCategoria(categoria).color }}
            />
            <span className="flex-1 truncate">{categoria}</span>
            <span className="monto tabular-nums text-muted-foreground">
              {enPesos(monto)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
