// src/app/(app)/loading.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EsqueletoCard, EsqueletoTitulo } from "@/components/esqueleto";

/** Carga del Inicio: la ecuación, los dos gráficos y la lista de ingresos. */
export default function CargandoInicio() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <EsqueletoTitulo />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-6">
          {["ingreso", "gasto"].map((tono) => (
            <div key={tono} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton
                className={`h-8 w-36 ${tono === "ingreso" ? "bg-ingreso/20" : "bg-gasto/20"}`}
              />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
          <div className="ml-auto space-y-2 text-right">
            <Skeleton className="ml-auto h-3 w-20" />
            <Skeleton className="ml-auto h-11 w-64" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-44" />
          </CardHeader>
          <CardContent>
            {/* Las barras arrancan a distinta altura: así se lee como un gráfico. */}
            <div className="flex h-48 items-end gap-2">
              {[45, 70, 35, 85, 60, 95].map((alto, i) => (
                <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${alto}%` }} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Skeleton className="size-48 shrink-0 rounded-full" />
            <div className="flex-1 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <EsqueletoCard filas={3} tono="ingreso" />
    </div>
  );
}
