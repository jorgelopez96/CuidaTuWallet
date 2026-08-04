// src/app/(app)/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enPesos } from "@/lib/formato";
import {
  porCategoria,
  rangoDelMes,
  serieMensual,
  variacion,
  ventanaDeMeses,
} from "@/lib/resumen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarrasMensuales } from "@/components/barras-mensuales";
import { EcuacionDelMes } from "@/components/ecuacion-del-mes";
import { GraficoGastos } from "@/components/grafico-gastos";
import { Hint } from "@/components/hint";
import { IngresoForm } from "@/components/ingreso-form";
import { ListaIngresos } from "@/components/lista-ingresos";

const MESES_DEL_GRAFICO = 6;

export default async function InicioPage() {
  const supabase = createServerSupabaseClient();
  const hoy = new Date();
  const { desde, hasta } = ventanaDeMeses(hoy, MESES_DEL_GRAFICO);
  const mesActual = rangoDelMes(hoy);

  // Una sola ventana de seis meses: de ahí salen el resumen del mes y la serie.
  const [ing, gas] = await Promise.all([
    supabase
      .from("ingresos")
      .select("id, concepto, monto, fecha")
      .gte("fecha", desde)
      .lte("fecha", hasta)
      .order("fecha", { ascending: false }),
    supabase
      .from("gastos")
      .select("monto, categoria, fecha")
      .gte("fecha", desde)
      .lte("fecha", hasta),
  ]);

  // Sin esto, un fallo de RLS o de red se vería como "$ 0" y parecería un mes sin movimientos.
  const falla = ing.error ?? gas.error;
  if (falla) throw new Error(`No se pudieron leer los movimientos: ${falla.message}`);

  const ingresos = ing.data ?? [];
  const gastos = gas.data ?? [];

  const serie = serieMensual(hoy, MESES_DEL_GRAFICO, ingresos, gastos);
  const actual = serie[serie.length - 1];
  const anterior = serie[serie.length - 2];
  const cambio = variacion(actual.disponible, anterior?.disponible ?? 0);

  const delMes = <T extends { fecha: string }>(xs: T[]) =>
    xs.filter((x) => x.fecha >= mesActual.desde && x.fecha <= mesActual.hasta);

  const ingresosDelMes = delMes(ingresos);
  const gastosDelMes = delMes(gastos);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Inicio</h1>
        <IngresoForm />
      </div>

      <Hint id="inicio">
        Acá ves cuánto entró y cuánto gastaste este mes. El disponible se calcula
        restando todos los gastos —sueltos y de tarjeta— a tus ingresos.
      </Hint>

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
            <CardTitle>Disponible mes a mes</CardTitle>
            <span className="text-xs text-muted-foreground">
              Últimos {MESES_DEL_GRAFICO} meses
            </span>
          </CardHeader>
          <CardContent>
            <BarrasMensuales serie={serie} />
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
