// src/app/(app)/tarjetas/[id]/loading.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EsqueletoFilas } from "@/components/esqueleto";

/** Carga del detalle de tarjeta: totales por titular y los gastos en cuotas. */
export default function CargandoDetalle() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <Skeleton className="h-4 w-20" />

      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="size-10 rounded-[12px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-5 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-[12px]" />
            <Skeleton className="h-10 w-36 rounded-[12px]" />
          </div>
        </CardHeader>
        <CardContent>
          <EsqueletoFilas filas={7} />
        </CardContent>
      </Card>
    </div>
  );
}
