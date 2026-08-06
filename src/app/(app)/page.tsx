// src/app/(app)/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enPesos } from "@/lib/formato";
import { ingresosDeMes } from "@/lib/ingresos";
import {
  mesDe,
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
import { MovimientosMensuales } from "@/components/movimientos-mensuales";

/** Este mes y el anterior: lo justo para la comparación de la ecuación. */
const MESES_COMPARADOS = 2;
const MESES_PROYECTADOS = 6;

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const hoy = new Date();
  const { desde, hasta } = ventanaDeMeses(hoy, MESES_COMPARADOS);
  const mesActual = rangoDelMes(hoy);

  const [ing, gas, tar] = await Promise.all([
    supabase
      .from("ingresos")
      .select("id, concepto, monto, fecha, recurrente, baja_el")
      .or(`recurrente.eq.true,and(fecha.gte.${desde},fecha.lte.${hasta})`)
      .order("fecha", { ascending: false }),
    supabase
      .from("gastos")
      .select(
        "id, descripcion, monto, categoria, fecha, tarjeta_id, es_propio, pagado, cuota_actual, cuotas_total",
      )
      .gte("fecha", desde)
      .lte("fecha", hasta),
    supabase.from("tarjetas").select("id, marca, banco, ultimos4"),
  ]);

  // Sin esto, un fallo de RLS o de red se vería como "$ 0" y parecería un mes sin movimientos.
  const falla = ing.error ?? gas.error ?? tar.error;
  if (falla) throw new Error(`No se pudieron leer los movimientos: ${falla.message}`);

  const ingresos = ing.data ?? [];

  // El dashboard es la plata tuya: lo que gastó un tercero al que le prestaste
  // la tarjeta queda registrado en la tarjeta, pero acá no entra por ningún lado.
  const gastos = (gas.data ?? []).filter((g) => g.es_propio);

  // Un resumen de tarjeta cargado pero impago todavía no salió de la cuenta:
  // se ve en los movimientos, pero no entra en la plata que se fue.
  const serie = serieMensual(
    hoy,
    MESES_COMPARADOS,
    ingresos,
    gastos.filter((g) => g.pagado),
  );
  const actual = serie[serie.length - 1];
  const anterior = serie[serie.length - 2];
  const cambio = variacion(actual.disponible, anterior?.disponible ?? 0);

  const delMes = <T extends { fecha: string }>(xs: T[]) =>
    xs.filter((x) => x.fecha >= mesActual.desde && x.fecha <= mesActual.hasta);

  // Los ingresos no se filtran por fecha: un recurrente es una sola fila vieja
  // que igual impacta este mes.
  const ingresosDelMes = ingresosDeMes(ingresos, mesDe(mesActual.desde));
  const gastosDelMes = delMes(gastos);
  const pagadosDelMes = gastosDelMes.filter((g) => g.pagado);

  // Solo las cuotas de este mes: las de meses anteriores ya fueron reemplazadas
  // por la fila del resumen siguiente y contarlas duplicaría el compromiso.
  const proyeccion = proyeccionDeCuotas(hoy, MESES_PROYECTADOS, gastosDelMes);

  return (
    <>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <EcuacionDelMes
        cobrado={actual.cobrado}
        gastado={actual.gastado}
        disponible={actual.disponible}
        cantidadIngresos={ingresosDelMes.length}
        cantidadGastos={pagadosDelMes.length}
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
            <GraficoGastos datos={porCategoria(pagadosDelMes)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-2">
          <CardTitle>Movimientos mensuales</CardTitle>
          <span
            className={`monto font-semibold tabular-nums ${
              actual.disponible < 0 ? "text-gasto" : "text-ingreso"
            }`}
          >
            {actual.disponible < 0 ? "−" : "+"} {enPesos(Math.abs(actual.disponible))}
          </span>
        </CardHeader>
        <CardContent>
          <MovimientosMensuales
            ingresos={ingresosDelMes}
            gastos={gastosDelMes}
            tarjetas={tar.data ?? []}
          />
        </CardContent>
      </Card>
    </>
  );
}
