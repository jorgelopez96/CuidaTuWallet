// src/components/lista-ingresos.tsx
"use client";

import { useState, useTransition } from "react";
import { CalendarOff, PiggyBank, Trash2 } from "lucide-react";
import { borrarIngreso, darDeBajaIngreso } from "@/app/(app)/_actions/ingresos";
import { enPesos } from "@/lib/formato";
import type { Ingreso } from "@/lib/ingresos";
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

const enDia = (iso: string) => iso.split("-").reverse().join("/");

export function ListaIngresos({
  ingresos,
  vacio = "Todavía no cargaste ingresos",
}: {
  ingresos: Ingreso[];
  vacio?: string;
}) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();

  if (!ingresos.length) {
    return (
      <Vacio
        icono={PiggyBank}
        titulo={vacio}
        detalle="Cargá tu sueldo o una venta y el disponible se calcula solo."
      />
    );
  }

  return (
    <>
      {error && <p className="pb-2 text-sm text-gasto">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Concepto</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingresos.map(({ id, concepto, monto, fecha, recurrente, baja_el }) => {
            // Solo un recurrente todavía abierto se da de baja; el resto se borra.
            const puedeDarseDeBaja = recurrente && !baja_el;

            return (
              <TableRow key={id}>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {concepto}
                    {recurrente && (
                      <Badge variant="secondary" className="font-normal">
                        Mensual
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {baja_el ? `hasta ${enDia(baja_el)}` : enDia(fecha)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-ingreso">
                  {enPesos(Number(monto))}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={
                      puedeDarseDeBaja ? `Dar de baja ${concepto}` : `Borrar ${concepto}`
                    }
                    title={puedeDarseDeBaja ? "Dar de baja" : "Borrar"}
                    disabled={pendiente}
                    onClick={() =>
                      iniciar(async () => {
                        const r = puedeDarseDeBaja
                          ? await darDeBajaIngreso(id)
                          : await borrarIngreso(id);
                        setError(r.error);
                      })
                    }
                  >
                    {puedeDarseDeBaja ? (
                      <CalendarOff className="text-muted-foreground" />
                    ) : (
                      <Trash2 className="text-gasto" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
