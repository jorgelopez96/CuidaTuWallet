// src/app/(app)/consumos/page.tsx
import { Plus, ShoppingBasket } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enPesos } from "@/lib/formato";
import { rangoDelMes, total } from "@/lib/resumen";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FiltroCategorias } from "@/components/filtro-categorias";
import { GastoForm } from "@/components/gasto-form";
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
      <div>
        <h1 className="text-2xl font-semibold">Consumos</h1>
        <p className="text-sm text-muted-foreground">
          Este mes: {enPesos(total(data ?? []))}
        </p>
      </div>

      {data?.length ? (
        <>
          <FiltroCategorias gastos={data} />

          {/* Solo en escritorio: en mobile el alta vive en el botón central del
              nav de abajo. Con la lista vacía tampoco se renderiza, porque el
              botón del estado vacío ya cumple esa función. */}
          <GastoForm>
            <Button
              size="icon"
              aria-label="Cargar gasto"
              className="fixed bottom-6 right-6 z-40 hidden size-14 rounded-full shadow-lg md:flex"
            >
              <Plus className="size-6" />
            </Button>
          </GastoForm>
        </>
      ) : (
        <Card>
          <Vacio
            icono={ShoppingBasket}
            titulo="Sin gastos registrados"
            detalle="Registrá tus gastos para ver en qué estás gastando"
          >
            <GastoForm>
              <Button>
                <Plus />
                Agregar
              </Button>
            </GastoForm>
          </Vacio>
        </Card>
      )}
    </>
  );
}
