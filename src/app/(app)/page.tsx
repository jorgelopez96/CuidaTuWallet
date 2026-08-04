// src/app/(app)/page.tsx
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { porCategoria, rangoDelMes, resumenMensual } from "@/lib/resumen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraficoGastos } from "@/components/grafico-gastos";
import { MontoAnimado } from "@/components/monto-animado";
import { Hint } from "@/components/hint";
import { IngresoForm } from "@/components/ingreso-form";
import { ListaIngresos } from "@/components/lista-ingresos";

export default async function InicioPage() {
  const supabase = createServerSupabaseClient();
  const { desde, hasta } = rangoDelMes(new Date());

  const [ing, gas] = await Promise.all([
    supabase
      .from("ingresos")
      .select("id, concepto, monto, fecha")
      .gte("fecha", desde)
      .lte("fecha", hasta)
      .order("fecha", { ascending: false }),
    supabase
      .from("gastos")
      .select("monto, categoria")
      .gte("fecha", desde)
      .lte("fecha", hasta),
  ]);

  // Sin esto, un fallo de RLS o de red se vería como "$ 0" y parecería un mes sin movimientos.
  const falla = ing.error ?? gas.error;
  if (falla) throw new Error(`No se pudieron leer los movimientos: ${falla.message}`);

  const { cobrado, gastado, disponible } = resumenMensual(
    ing.data ?? [],
    gas.data ?? [],
  );

  const resumen = [
    { titulo: "Ingresos del mes", valor: cobrado, color: "text-ingreso", icono: TrendingUp },
    { titulo: "Gastos del mes", valor: gastado, color: "text-gasto", icono: TrendingDown },
    { titulo: "Disponible", valor: disponible, color: "", icono: Wallet },
  ];

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
      <div className="grid gap-4 md:grid-cols-3">
        {resumen.map(({ titulo, valor, color, icono: Icono }) => (
          <Card key={titulo} className="elevable">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icono className={`size-4 ${color}`} />
                {titulo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MontoAnimado
                valor={valor}
                className={`block text-3xl font-semibold ${color}`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos del mes</CardTitle>
          </CardHeader>
          <CardContent>
            <ListaIngresos ingresos={ing.data ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoGastos datos={porCategoria(gas.data ?? [])} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
