// src/app/(app)/ingresos/page.tsx
import { PiggyBank } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { enPesos } from "@/lib/formato";
import { esActivo, historialPorMes, type Ingreso } from "@/lib/ingresos";
import { mesDe, rangoDelMes, total } from "@/lib/resumen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IngresoForm } from "@/components/ingreso-form";
import { ListaIngresos } from "@/components/lista-ingresos";
import { Vacio } from "@/components/vacio";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** "agosto 2026" a partir de una clave "2026-08". */
const nombreDeMes = (clave: string) => {
  const [anio, mes] = clave.split("-").map(Number);
  return `${MESES[mes - 1]} ${anio}`;
};

export default async function IngresosPage() {
  // Mes en curso en hora local: `rangoDelMes` no usa UTC, así que después de las
  // 21 h no salta al día siguiente como haría toISOString().
  const mesActual = mesDe(rangoDelMes(new Date()).desde);

  const { data, error } = await createServerSupabaseClient()
    .from("ingresos")
    .select("id, concepto, monto, fecha, recurrente, baja_el")
    .order("fecha", { ascending: false });

  if (error) throw new Error(`No se pudieron leer los ingresos: ${error.message}`);

  const ingresos = (data ?? []) as Ingreso[];
  const activos = ingresos.filter((i) => esActivo(i, mesActual));
  const historial = ingresos.filter((i) => !esActivo(i, mesActual));

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Ingresos</h1>
          <p className="text-sm text-muted-foreground">
            Total activo: {enPesos(total(activos))}
          </p>
        </div>
        <IngresoForm />
      </div>

      <Tabs defaultValue="activos">
        <TabsList>
          <TabsTrigger value="activos">Activos</TabsTrigger>
          <TabsTrigger value="historial">Historial ({historial.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <Card>
            {activos.length ? (
              <CardContent>
                <ListaIngresos ingresos={activos} />
              </CardContent>
            ) : (
              <Vacio
                icono={PiggyBank}
                titulo="Sin ingresos activos"
                detalle="Registrá tu sueldo u otros ingresos"
              >
                <IngresoForm etiqueta="Agregar ingreso" />
              </Vacio>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="mt-4 flex flex-col gap-4">
          {historial.length ? (
            historialPorMes(historial).map(({ mes, ingresos: delMes }) => (
              <Card key={mes}>
                <CardHeader className="flex items-center justify-between gap-2">
                  <CardTitle className="capitalize">{nombreDeMes(mes)}</CardTitle>
                  <span className="tabular-nums text-muted-foreground">
                    {enPesos(total(delMes))}
                  </span>
                </CardHeader>
                <CardContent>
                  <ListaIngresos ingresos={delMes} />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <Vacio
                icono={PiggyBank}
                titulo="Todavía no hay historial"
                detalle="Acá van a quedar los ingresos de meses cerrados y los recurrentes que des de baja."
              />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
