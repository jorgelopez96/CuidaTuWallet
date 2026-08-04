// src/components/lista-ingresos.tsx
"use client";

import { useState, useTransition } from "react";
import { PiggyBank, Trash2 } from "lucide-react";
import { borrarIngreso } from "@/app/(app)/_actions/ingresos";
import { enPesos } from "@/lib/formato";
import { Vacio } from "@/components/vacio";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Ingreso = {
  id: string;
  concepto: string;
  monto: number | string;
  fecha: string;
};

export function ListaIngresos({ ingresos }: { ingresos: Ingreso[] }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string>();

  if (!ingresos.length) {
    return (
      <Vacio
        icono={PiggyBank}
        titulo="Todavía no cargaste ingresos"
        detalle="Cargá tu sueldo o una venta con el botón de arriba y el disponible se calcula solo."
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
          {ingresos.map(({ id, concepto, monto, fecha }) => (
            <TableRow key={id}>
              <TableCell className="font-medium">{concepto}</TableCell>
              <TableCell className="text-muted-foreground">
                {fecha.split("-").reverse().join("/")}
              </TableCell>
              <TableCell className="text-right tabular-nums text-ingreso">
                {enPesos(Number(monto))}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Borrar ${concepto}`}
                  disabled={pendiente}
                  onClick={() =>
                    iniciar(async () => {
                      const r = await borrarIngreso(id);
                      setError(r.error);
                    })
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
