// src/components/tarjeta-form.tsx
"use client";

import { Plus } from "lucide-react";
import { crearTarjeta } from "@/app/(app)/_actions/tarjetas";
import { MARCAS } from "@/lib/catalogos";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TarjetaForm() {
  const { abierto, setAbierto, estado, enviar, pendiente } =
    useFormDialog(crearTarjeta);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Agregar tarjeta
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva tarjeta</DialogTitle>
        </DialogHeader>

        <form action={enviar} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="marca">Marca</Label>
            <Select name="marca" defaultValue="Visa">
              <SelectTrigger id="marca">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARCAS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="banco">Banco (opcional)</Label>
            <Input id="banco" name="banco" placeholder="Galicia" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ultimos4">Últimos 4 dígitos</Label>
            <Input
              id="ultimos4"
              name="ultimos4"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="1234"
              required
            />
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
