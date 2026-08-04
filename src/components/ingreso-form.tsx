// src/components/ingreso-form.tsx
"use client";

import { Plus } from "lucide-react";
import { crearIngreso } from "@/app/(app)/_actions/ingresos";
import { useFormDialog } from "@/hooks/use-form-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MontoInput } from "@/components/monto-input";
import { Label } from "@/components/ui/label";

const hoy = () => new Date().toISOString().slice(0, 10);

export function IngresoForm() {
  const { abierto, setAbierto, estado, enviar, pendiente } =
    useFormDialog(crearIngreso);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Cargar ingreso
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo ingreso</DialogTitle>
        </DialogHeader>

        <form action={enviar} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="concepto">Concepto</Label>
            <Input id="concepto" name="concepto" placeholder="Sueldo" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="monto">Monto</Label>
            <MontoInput />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input id="fecha" name="fecha" type="date" defaultValue={hoy()} required />
          </div>

          {estado.error && <p className="text-sm text-gasto">{estado.error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pendiente}>
              {pendiente ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
