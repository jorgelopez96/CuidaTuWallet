// src/components/borrar-tarjeta.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { borrarTarjeta } from "@/app/(app)/_actions/tarjetas";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

/**
 * Doble confirmación: además de abrir el diálogo hay que tipear los últimos 4
 * dígitos. Borrar una tarjeta se lleva puestos todos sus gastos (cascade).
 */
export function BorrarTarjeta({
  id,
  ultimos4,
  volverA,
}: {
  id: string;
  ultimos4: string;
  volverA?: string;
}) {
  const [tipeado, setTipeado] = useState("");
  const [error, setError] = useState<string>();
  const [pendiente, iniciar] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog onOpenChange={() => setTipeado("")}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Borrar tarjeta">
          <Trash2 className="text-gasto" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Borrar esta tarjeta?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borran también todos los gastos cargados en ella. No se puede deshacer.
            Escribí <strong>{ultimos4}</strong> para confirmar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Input
          value={tipeado}
          onChange={(e) => setTipeado(e.target.value)}
          placeholder={ultimos4}
          inputMode="numeric"
          maxLength={4}
          aria-label="Últimos 4 dígitos"
        />
        {error && <p className="text-sm text-gasto">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={tipeado !== ultimos4 || pendiente}
            onClick={(e) => {
              e.preventDefault();
              iniciar(async () => {
                const r = await borrarTarjeta(id);
                if (r.error) return setError(r.error);
                if (volverA) router.push(volverA);
              });
            }}
          >
            {pendiente ? "Borrando…" : "Borrar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
