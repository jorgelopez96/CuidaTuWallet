// src/components/gasto-form.tsx
"use client";

import { Plus } from "lucide-react";
import { crearGasto } from "@/app/(app)/_actions/gastos";
import { CATEGORIAS, MEDIOS, NOMBRE_MEDIO } from "@/lib/catalogos";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const hoy = () => new Date().toISOString().slice(0, 10);

// Crédito no está: ese gasto se carga desde el detalle de su tarjeta.
const MEDIOS_SUELTOS = MEDIOS.filter((m) => m !== "credito");

/**
 * Con `tarjetaId` el gasto es de crédito: suma cuotas y propio/ajeno.
 * `children` reemplaza el botón que abre el diálogo, para el flotante y el del
 * estado vacío. Tiene que ser un único elemento: lo exige `DialogTrigger asChild`.
 */
export function GastoForm({
  tarjetaId,
  children,
}: {
  tarjetaId?: string;
  children?: React.ReactNode;
}) {
  const { abierto, setAbierto, estado, enviar, pendiente } =
    useFormDialog(crearGasto);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        {children ?? (
          <Button>
            <Plus />
            Cargar gasto
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo gasto</DialogTitle>
        </DialogHeader>

        <form action={enviar} className="grid gap-4">
          {tarjetaId && (
            <>
              <input type="hidden" name="tarjeta_id" value={tarjetaId} />
              <input type="hidden" name="medio_pago" value="credito" />
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              name="descripcion"
              placeholder="Verdulería"
              required
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="monto">Monto</Label>
              <MontoInput />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" defaultValue={hoy()} required />
            </div>
          </div>

          {!tarjetaId && (
            <div className="grid gap-2">
              <Label htmlFor="medio_pago">Medio de pago</Label>
              <Select name="medio_pago" defaultValue="efectivo">
                <SelectTrigger id="medio_pago">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIOS_SUELTOS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {NOMBRE_MEDIO[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Select name="categoria" defaultValue="Otros">
              <SelectTrigger id="categoria">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tarjetaId && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="es_propio">¿De quién es el gasto?</Label>
                <Select name="es_propio" defaultValue="propio">
                  <SelectTrigger id="es_propio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="propio">Mío</SelectItem>
                    <SelectItem value="ajeno">De un tercero</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="cuota_actual">Cuota (opcional)</Label>
                  <Input id="cuota_actual" name="cuota_actual" type="number" min="1" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cuotas_total">De</Label>
                  <Input id="cuotas_total" name="cuotas_total" type="number" min="1" />
                </div>
              </div>
            </>
          )}

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
