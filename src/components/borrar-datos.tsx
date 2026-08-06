// src/components/borrar-datos.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { borrarTodosLosDatos } from "@/app/(app)/_actions/datos";
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

/**
 * Doble confirmación: la primera pregunta se puede contestar en piloto
 * automático, la segunda obliga a leer. Recién ahí se borra.
 */
export function BorrarDatos({ children }: { children: React.ReactNode }) {
  const [paso, setPaso] = useState(1);
  const [error, setError] = useState<string>();
  const [pendiente, iniciar] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog
      onOpenChange={(abierto) => {
        if (!abierto) return;
        setPaso(1);
        setError(undefined);
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {paso === 1
              ? "¿Seguro que querés borrar todos los datos?"
              : "Esta acción no se puede deshacer"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {paso === 1
              ? "Se borran tus tarjetas, tus gastos y tus ingresos. Tu cuenta y tu sesión quedan como están."
              : "No hay copia de respaldo ni forma de recuperar lo borrado. Vas a tener que cargar todo de nuevo."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-sm text-gasto">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel>No, volver</AlertDialogCancel>
          <AlertDialogAction
            disabled={pendiente}
            className="bg-gasto text-white hover:bg-gasto/90"
            onClick={(e) => {
              // Sin esto el diálogo se cierra solo y no hay segundo paso.
              e.preventDefault();
              if (paso === 1) return setPaso(2);

              iniciar(async () => {
                const r = await borrarTodosLosDatos();
                if (r.error) return setError(r.error);
                router.push("/");
              });
            }}
          >
            {pendiente ? "Borrando…" : paso === 1 ? "Sí, continuar" : "Sí, borrar todo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
