// src/app/(app)/ingresos/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { EsqueletoCard, EsqueletoTitulo } from "@/components/esqueleto";

/** Carga de Ingresos: el encabezado con el total, las dos pestañas y la lista. */
export default function CargandoIngresos() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <EsqueletoTitulo />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <EsqueletoCard filas={4} tono="ingreso" />
    </div>
  );
}
