// src/components/tarjeta-visual.tsx
import Link from "next/link";
import { enPesos } from "@/lib/formato";
import { Card } from "@/components/ui/card";
import { BorrarTarjeta } from "@/components/borrar-tarjeta";
import { LogoMarca } from "@/components/logo-marca";

export type Tarjeta = {
  id: string;
  marca: string;
  banco: string | null;
  ultimos4: string;
};

/**
 * Degradé por marca. Ninguno usa azul índigo puro: se confundiría con el fondo
 * de la app, que ya es índigo.
 */
const DEGRADES: Record<string, string> = {
  Visa: "from-violet-700/70 to-indigo-900/70",
  Mastercard: "from-orange-700/70 to-red-900/70",
  "American Express": "from-emerald-700/70 to-teal-900/70",
  "Naranja X": "from-orange-600/70 to-amber-800/70",
  Cabal: "from-sky-700/70 to-cyan-900/70",
  Otra: "from-slate-600/70 to-slate-800/70",
};

export function TarjetaVisual({
  tarjeta,
  gastado,
  cantidad,
}: {
  tarjeta: Tarjeta;
  gastado: number;
  cantidad: number;
}) {
  const { id, marca, banco, ultimos4 } = tarjeta;
  const degrade = DEGRADES[marca] ?? DEGRADES.Otra;

  return (
    // Proporción y radio de una tarjeta real: 85,6 × 54 mm (1,586:1) y ~3,5 mm
    // de radio. La marca va abajo a la derecha, como en el plástico.
    <Card className="elevable group relative aspect-[1.586] gap-0 overflow-hidden rounded-[14px] p-5 text-white">
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${degrade}`}
      />

      {/* z-20: por encima del overlay que hace clickeable toda la tarjeta. */}
      <div className="relative z-20 flex items-start justify-between gap-3">
        <p className="truncate text-xl font-bold">{banco ?? marca}</p>
        <BorrarTarjeta id={id} ultimos4={ultimos4} />
      </div>

      <p className="relative mt-auto whitespace-nowrap font-mono text-sm tracking-[0.18em] text-white/75">
        •••• •••• •••• {ultimos4}
      </p>

      <div className="relative mt-auto flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-white/60">
            Este mes · {cantidad} gasto{cantidad === 1 ? "" : "s"}
          </p>
          <p className="text-xl font-bold tabular-nums">{enPesos(gastado)}</p>
        </div>
        <LogoMarca marca={marca} />
      </div>

      <Link href={`/tarjetas/${id}`} className="absolute inset-0">
        <span className="sr-only">
          Ver {marca} terminada en {ultimos4}
        </span>
      </Link>
    </Card>
  );
}
