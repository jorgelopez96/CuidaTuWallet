// src/app/(app)/page.tsx
import { TrendingDown, TrendingUp } from "lucide-react";
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
import { GraficoGastos } from "@/components/grafico-gastos";
import { MontoAnimado } from "@/components/monto-animado";
import { Hint } from "@/components/hint";
import { IngresoForm } from "@/components/ingreso-form";
import { ListaIngresos } from "@/components/lista-ingresos";

const MESES_DEL_GRAFICO = 6;

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const nombreLargo = (clave: string) => MESES[Number(clave.slice(5, 7)) - 1];

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

      {/* La ecuación: entró menos salió da el disponible. */}
      <Card className="elevable">
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-6">
          <div>
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <TrendingUp className="size-3.5 text-ingreso" />
              Entró
            </p>
            <MontoAnimado
              valor={actual.cobrado}
              className="block text-2xl font-semibold text-ingreso"
            />
            <p className="text-xs text-muted-foreground">
              {ingresosDelMes.length} ingreso{ingresosDelMes.length === 1 ? "" : "s"}
            </p>
          </div>

          <span className="text-2xl text-muted-foreground">−</span>

          <div>
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
              <TrendingDown className="size-3.5 text-gasto" />
              Salió
            </p>
            <MontoAnimado
              valor={actual.gastado}
              className="block text-2xl font-semibold text-gasto"
            />
            <p className="text-xs text-muted-foreground">
              {gastosDelMes.length} gasto{gastosDelMes.length === 1 ? "" : "s"}
            </p>
          </div>

          <span className="text-2xl text-muted-foreground">=</span>

          <div className="ml-auto text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Disponible
            </p>
            <MontoAnimado
              valor={actual.disponible}
              className="block text-4xl font-bold tracking-tight"
            />
            {cambio !== null && (
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                  cambio >= 0 ? "bg-ingreso/15 text-ingreso" : "bg-gasto/15 text-gasto"
                }`}
              >
                {cambio >= 0 ? "▲" : "▼"} {Math.abs(Math.round(cambio))}% vs.{" "}
                {nombreLargo(anterior.mes)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

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
