// src/components/lista-gastos.tsx
"use client";

import { useState, useTransition } from "react";
import { Receipt, Trash2 } from "lucide-react";
import { borrarGasto } from "@/app/(app)/_actions/gastos";
import { enPesos } from "@/lib/formato";
import { NOMBRE_MEDIO, type Medio } from "@/lib/catalogos";
import { IconoCategoria } from "@/components/categorias";
import { Vacio } from "@/components/vacio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Gasto = {
  id: string;
  descripcion: string;
  categoria: string | null;
  monto: number | string;
  fecha: string;
  es_propio: boolean;
  medio_pago: Medio;
  cuota_actual: number | null;
  cuotas_total: number | null;
};

export function ListaGastos({
  gastos,
  mostrarTitular = false,
  mostrarMedio = false,
  vacio = "Todavía no cargaste gastos.",
}: {
  gastos: Gasto[];
  mostrarTitular?: boolean;
  mostrarMedio?: boolean;
  vacio?: string;
}) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();

  if (!gastos.length) {
    return <Vacio icono={Receipt} titulo={vacio} />;
  }

  return (
    <>
      {error && <p className="pb-2 text-sm text-gasto">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descripción</TableHead>
            <TableHead>Fecha</TableHead>
            {mostrarMedio && <TableHead>Medio</TableHead>}
            {mostrarTitular && <TableHead>Titular</TableHead>}
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {gastos.map((g) => (
            <TableRow key={g.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <IconoCategoria categoria={g.categoria} />
                  <div>
                <span className="font-medium">{g.descripcion}</span>
                {g.categoria && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {g.categoria}
                  </span>
                )}
                {g.cuotas_total && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    cuota {g.cuota_actual}/{g.cuotas_total}
                  </span>
                )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {g.fecha.split("-").reverse().join("/")}
              </TableCell>
              {mostrarMedio && (
                <TableCell className="text-muted-foreground">
                  {NOMBRE_MEDIO[g.medio_pago]}
                </TableCell>
              )}
              {mostrarTitular && (
                <TableCell>
                  <Badge variant={g.es_propio ? "secondary" : "outline"}>
                    {g.es_propio ? "Propio" : "Tercero"}
                  </Badge>
                </TableCell>
              )}
              <TableCell className="text-right tabular-nums text-gasto">
                {enPesos(Number(g.monto))}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Borrar ${g.descripcion}`}
                  disabled={pendiente}
                  onClick={() =>
                    iniciar(async () => setError((await borrarGasto(g.id)).error))
                  }
                >
                  <Trash2 className="text-gasto" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
