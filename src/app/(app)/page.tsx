// src/app/(app)/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enPesos } from "@/lib/formato";
import {
  porCategoria,
  proyeccionDeCuotas,
  rangoDelMes,
  serieMensual,
  variacion,
  ventanaDeMeses,
} from "@/lib/resumen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarrasMensuales } from "@/components/barras-mensuales";
import { EcuacionDelMes } from "@/components/ecuacion-del-mes";
import { GraficoGastos } from "@/components/grafico-gastos";
import { IngresoForm } from "@/components/ingreso-form";
import { ListaIngresos } from "@/components/lista-ingresos";

/** Este mes y el anterior: lo justo para la comparación de la ecuación. */
const MESES_COMPARADOS = 2;
const MESES_PROYECTADOS = 6;

export default async function InicioPage() {
  const supabase = createServerSupabaseClient();
  const hoy = new Date();
  const { desde, hasta } = ventanaDeMeses(hoy, MESES_COMPARADOS);
  const mesActual = rangoDelMes(hoy);

  const [ing, gas] = await Promise.all([
    supabase
      .from("ingresos")
      .select("id, concepto, monto, fecha")
      .gte("fecha", desde)
      .lte("fecha", hasta)
      .order("fecha", { ascending: false }),
    supabase
      .from("gastos")
      .select("monto, categoria, fecha, cuota_actual, cuotas_total")
      .gte("fecha", desde)
      .lte("fecha", hasta),
  ]);

  // Sin esto, un fallo de RLS o de red se vería como "$ 0" y parecería un mes sin movimientos.
  const falla = ing.error ?? gas.error;
  if (falla) throw new Error(`No se pudieron leer los movimientos: ${falla.message}`);

  const ingresos = ing.data ?? [];
  const gastos = gas.data ?? [];

  const serie = serieMensual(hoy, MESES_COMPARADOS, ingresos, gastos);
  const actual = serie[serie.length - 1];
  const anterior = serie[serie.length - 2];
  const cambio = variacion(actual.disponible, anterior?.disponible ?? 0);

  const delMes = <T extends { fecha: string }>(xs: T[]) =>
    xs.filter((x) => x.fecha >= mesActual.desde && x.fecha <= mesActual.hasta);

  const ingresosDelMes = delMes(ingresos);
  const gastosDelMes = delMes(gastos);

  // Solo las cuotas de este mes: las de meses anteriores ya fueron reemplazadas
  // por la fila del resumen siguiente y contarlas duplicaría el compromiso.
  const proyeccion = proyeccionDeCuotas(hoy, MESES_PROYECTADOS, gastosDelMes);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Inicio</h1>
        <IngresoForm />
      </div>

      <EcuacionDelMes
        cobrado={actual.cobrado}
        gastado={actual.gastado}
        disponible={actual.disponible}
        cantidadIngresos={ingresosDelMes.length}
        cantidadGastos={gastosDelMes.length}
        cambio={cambio}
        mesAnterior={anterior?.mes}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="elevable">
          <CardHeader className="flex items-center justify-between gap-2">
            <CardTitle>Lo que viene</CardTitle>
            <span className="text-xs text-muted-foreground">
              Cuánto pagás en cuotas, mes a mes
            </span>
          </CardHeader>
          <CardContent>
            <BarrasMensuales serie={proyeccion} />
          </CardContent>
        </Card>

        <Card className="elevable">
          <CardHeader>
            <CardTitle>En qué se va</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoGastos datos={porCategoria(gastosDelMes)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle>Ingresos del mes</CardTitle>
          <span className="tabular-nums text-muted-foreground">
            {enPesos(actual.cobrado)}
          </span>
        </CardHeader>
        <CardContent>
          <ListaIngresos ingresos={ingresosDelMes} />
        </CardContent>
      </Card>
    </>
  );
}
