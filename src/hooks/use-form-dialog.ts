// src/hooks/use-form-dialog.ts
"use client";

import { useActionState, useState } from "react";
import type { Resultado } from "@/app/(app)/_actions/ingresos";

type Accion = (previo: Resultado, form: FormData) => Promise<Resultado>;

/**
 * Diálogo con formulario: cierra recién cuando el server confirma que guardó.
 * El cierre va dentro de la acción, no en un efecto, para no re-renderizar de más.
 */
export function useFormDialog(accion: Accion) {
  const [abierto, setAbierto] = useState(false);

  const [estado, enviar, pendiente] = useActionState<Resultado, FormData>(
    async (previo, form) => {
      const resultado = await accion(previo, form);
      if (!resultado.error) setAbierto(false);
      return resultado;
    },
    {},
  );

  return { abierto, setAbierto, estado, enviar, pendiente };
}
