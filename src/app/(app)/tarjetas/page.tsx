// src/app/(app)/tarjetas/page.tsx
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { totalesPorTitular } from "@/lib/resumen";
import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Hint } from "@/components/hint";
import { Vacio } from "@/components/vacio";
import { TotalesGastos } from "@/components/totales-gastos";
import { TarjetaForm } from "@/components/tarjeta-form";
import { TarjetaVisual } from "@/components/tarjeta-visual";

export default async function TarjetasPage() {
  const supabase = createServerSupabaseClient();

  const [tarjetas, gastos] = await Promise.all([
    supabase.from("tarjetas").select("id, marca, banco, ultimos4").order("created_at"),
    // Todos los gastos de crédito, de todas las tarjetas: el resumen de arriba.
    supabase
      .from("gastos")
      .select("monto, es_propio, tarjeta_id")
      .not("tarjeta_id", "is", null),
  ]);

  const error = tarjetas.error ?? gastos.error;
  if (error) throw new Error(`No se pudieron leer las tarjetas: ${error.message}`);

  const data = tarjetas.data;
  const { propios, ajenos } = totalesPorTitular(gastos.data ?? []);

  // Total y cantidad de gastos por tarjeta, para mostrarlos en cada card.
  const porTarjeta = new Map<string, { gastado: number; cantidad: number }>();
  for (const g of gastos.data ?? []) {
    const acumulado = porTarjeta.get(g.tarjeta_id) ?? { gastado: 0, cantidad: 0 };
    porTarjeta.set(g.tarjeta_id, {
      gastado: acumulado.gastado + Number(g.monto),
      cantidad: acumulado.cantidad + 1,
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Tarjetas</h1>
        <TarjetaForm />
      </div>

      <Hint id="tarjetas">
        Cargá tus tarjetas de crédito y entrá a cada una para ver sus gastos. Podés
        subir el resumen y que los consumos se carguen solos: el archivo se lee al
        vuelo y no se guarda en ningún lado.
      </Hint>

      <TotalesGastos propios={propios} ajenos={ajenos} />

      {/* auto-fill: las tarjetas rondan los 272-340px y entran las que quepan.
          En pantallas angostas minmax cae a 100% y quedan una debajo de otra. */}
      {data?.length ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,17rem),1fr))]">
          {data.map((t) => (
            <TarjetaVisual
              key={t.id}
              tarjeta={t}
              gastado={porTarjeta.get(t.id)?.gastado ?? 0}
              cantidad={porTarjeta.get(t.id)?.cantidad ?? 0}
            />
          ))}
        </div>
      ) : (
        <Card>
          <Vacio
            icono={CreditCard}
            titulo="Todavía no cargaste ninguna tarjeta"
            detalle="Agregá tus tarjetas de crédito para llevar el control de cada resumen por separado."
          />
        </Card>
      )}
    </>
  );
}
