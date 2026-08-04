// src/app/(app)/consumos/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { EsqueletoCard, EsqueletoTitulo } from "@/components/esqueleto";

/** Carga de Consumos: los cuatro chips de categoría y la lista. */
export default function CargandoConsumos() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <EsqueletoTitulo />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[104px] rounded-2xl" />
        ))}
      </div>

      <EsqueletoCard filas={8} />
    </div>
  );
}
