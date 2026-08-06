// src/components/grafico-gastos.tsx
import { PieChart as IconoTorta } from "lucide-react";
import { enPesos } from "@/lib/formato";
import { estiloDeCategoria } from "@/components/categorias";
import { Vacio } from "@/components/vacio";

type Dato = { categoria: string; monto: number };

/** Geometría de la dona, en unidades del viewBox de 100. */
const RADIO = 40;
const GROSOR = 14;
const VUELTA = 2 * Math.PI * RADIO;
const HUECO = 1;

/** Lo que tarda en dibujarse el anillo entero, en segundos. */
const GIRO = 1.5;

/**
 * Dona de gastos por categoría. Es un SVG a mano y no una librería de
 * gráficos: son cuatro arcos y traer recharts costaba 320 KB de JS que en un
 * teléfono modesto hay que descargar, parsear y ejecutar.
 */
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

  const porciones = datos.map((d, i) => {
    const acumulado = datos.slice(0, i).reduce((t, x) => t + x.monto, 0);
    const largo = (d.monto / total) * VUELTA;
    // El hueco separa las porciones; sin el piso, una porción diminuta
    // desaparecería del todo al restárselo.
    return {
      ...d,
      desde: (acumulado / total) * VUELTA,
      largo: Math.max(largo - HUECO, 0.5),
    };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-10">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="monto text-lg font-semibold tabular-nums">{enPesos(total)}</span>
          <span className="text-xs text-muted-foreground">este mes</span>
        </div>

        <svg
          viewBox="0 0 100 100"
          className="size-56 -rotate-90"
          role="img"
          aria-label={`Gastos por categoría, ${enPesos(total)} en total`}
        >
          {porciones.map(({ categoria, desde, largo }) => (
            <circle
              key={categoria}
              className="porcion"
              cx="50"
              cy="50"
              r={RADIO}
              fill="none"
              strokeWidth={GROSOR}
              stroke={estiloDeCategoria(categoria).color}
              strokeDasharray={`${largo} ${VUELTA - largo}`}
              strokeDashoffset={-desde}
              style={
                {
                  "--vuelta": VUELTA,
                  "--dur": `${(largo / VUELTA) * GIRO}s`,
                  "--espera": `${(desde / VUELTA) * GIRO}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </svg>
      </div>

      <ul className="flex w-full flex-col gap-2 text-sm sm:max-w-xs">
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
