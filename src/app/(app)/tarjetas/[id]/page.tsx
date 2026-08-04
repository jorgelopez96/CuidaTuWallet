// src/app/(app)/tarjetas/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { totalesPorTitular } from "@/lib/resumen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorrarTarjeta } from "@/components/borrar-tarjeta";
import { GastoForm } from "@/components/gasto-form";
import { ListaGastos } from "@/components/lista-gastos";
import { SubirResumen } from "@/components/subir-resumen";
import { TotalesGastos } from "@/components/totales-gastos";

export default async function TarjetaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();

  const [tarjeta, gastos] = await Promise.all([
    supabase.from("tarjetas").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("gastos")
      .select("id, descripcion, categoria, monto, fecha, es_propio, medio_pago, cuota_actual, cuotas_total")
      .eq("tarjeta_id", id)
      .order("fecha", { ascending: false }),
  ]);

  if (tarjeta.error) throw new Error(tarjeta.error.message);
  if (!tarjeta.data) notFound();
  if (gastos.error) throw new Error(gastos.error.message);

  const { propios, ajenos } = totalesPorTitular(gastos.data ?? []);
  const { marca, banco, ultimos4 } = tarjeta.data;

  return (
    <>
      <Link
        href="/tarjetas"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Tarjetas
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {marca} •••• {ultimos4}
          </h1>
          {banco && <p className="text-muted-foreground">{banco}</p>}
        </div>
        <BorrarTarjeta id={id} ultimos4={ultimos4} volverA="/tarjetas" />
      </div>

      <TotalesGastos propios={propios} ajenos={ajenos} />

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Gastos de la tarjeta</CardTitle>
          <div className="flex items-center gap-2">
            <GastoForm tarjetaId={id} />
            <SubirResumen tarjetaId={id} ultimos4={ultimos4} />
          </div>
        </CardHeader>
        <CardContent>
          <ListaGastos
            gastos={gastos.data ?? []}
            mostrarTitular
            vacio="Todavía no cargaste gastos en esta tarjeta."
          />
        </CardContent>
      </Card>
    </>
  );
}
