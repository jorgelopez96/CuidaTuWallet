// src/components/esqueleto.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueletos de carga. Reproducen la grilla real —mismas columnas, mismas
 * alturas— para que al llegar los datos nada se mueva de lugar. Sin spinners:
 * un spinner no dice nada sobre lo que viene.
 */

/** Barra con el color semántico del monto, para que el ojo ya sepa qué va ahí. */
function BarraMonto({ tono }: { tono: "ingreso" | "gasto" | "neutro" }) {
  const color =
    tono === "ingreso" ? "bg-ingreso/20" : tono === "gasto" ? "bg-gasto/20" : "bg-foreground/10";
  return <Skeleton className={`h-4 w-24 ${color}`} />;
}

export function EsqueletoFilas({
  filas = 6,
  tono = "gasto",
}: {
  filas?: number;
  tono?: "ingreso" | "gasto" | "neutro";
}) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: filas }, (_, i) => (
        <li key={i} className="flex items-center gap-3 py-2.5">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-1.5">
            {/* Anchos distintos por fila: un bloque parejo se lee como error. */}
            <Skeleton className="h-4" style={{ width: `${45 + ((i * 13) % 35)}%` }} />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="hidden h-3 w-16 sm:block" />
          <BarraMonto tono={tono} />
          <Skeleton className="size-8 shrink-0 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}

export function EsqueletoCard({
  filas = 6,
  tono = "gasto",
}: {
  filas?: number;
  tono?: "ingreso" | "gasto" | "neutro";
}) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <EsqueletoFilas filas={filas} tono={tono} />
      </CardContent>
    </Card>
  );
}

export function EsqueletoTitulo() {
  return (
    <div className="flex items-center justify-between gap-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-36 rounded-[12px]" />
    </div>
  );
}
