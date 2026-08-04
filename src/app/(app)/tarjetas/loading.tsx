// src/app/(app)/tarjetas/loading.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EsqueletoTitulo } from "@/components/esqueleto";

/** Carga de Tarjetas: los tres totales y la grilla de plásticos. */
export default function CargandoTarjetas() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <EsqueletoTitulo />

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

      {/* Mismo aspecto que las tarjetas reales: al llegar los datos nada salta. */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,17rem),1fr))]">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="aspect-[1.586] rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
