// src/app/(app)/consumos/page.tsx
import { ShoppingBasket } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enPesos } from "@/lib/formato";
import { rangoDelMes, total } from "@/lib/resumen";
import { Card } from "@/components/ui/card";
import { FiltroCategorias } from "@/components/filtro-categorias";
import { GastoForm } from "@/components/gasto-form";
import { Hint } from "@/components/hint";
import { Vacio } from "@/components/vacio";

export default async function ConsumosPage() {
  const { desde, hasta } = rangoDelMes(new Date());

  // tarjeta_id null = gasto suelto. Los de crédito viven en el detalle de su tarjeta.
  const { data, error } = await createServerSupabaseClient()
    .from("gastos")
    .select(
      "id, descripcion, categoria, monto, fecha, es_propio, medio_pago, cuota_actual, cuotas_total",
    )
    .is("tarjeta_id", null)
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .order("fecha", { ascending: false });

  if (error) throw new Error(`No se pudieron leer los consumos: ${error.message}`);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Consumos</h1>
          <p className="text-sm text-muted-foreground">
            Este mes: {enPesos(total(data ?? []))}
          </p>
        </div>
        <GastoForm />
      </div>

      <Hint id="consumos">
        Los gastos sueltos van acá: verdulería, SUBE, Netflix, un Uber. Todo lo que
        cargues descuenta del disponible del mes.
      </Hint>

      {data?.length ? (
        <FiltroCategorias gastos={data} />
      ) : (
        <Card>
          <Vacio
            icono={ShoppingBasket}
            titulo="Todavía no cargaste consumos este mes"
            detalle="Verdulería, SUBE, Netflix: todo lo que pagás fuera de la tarjeta de crédito va acá."
          />
        </Card>
      )}
    </>
  );
}
