// src/app/(app)/_actions/datos.ts
"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Resultado } from "./ingresos";

/**
 * Vacía la cuenta: tarjetas, gastos e ingresos. La cuenta de Clerk no se toca,
 * así que la sesión sigue abierta y se puede empezar de cero.
 *
 * Las RLS acotan cada delete a las filas del usuario, pero supabase-js exige un
 * filtro explícito para no dejar pasar un delete sin where por accidente: de ahí
 * el `not("id", "is", null)`, que matchea todo lo que la política ya permite.
 */
export async function borrarTodosLosDatos(): Promise<Resultado> {
  const supabase = createServerSupabaseClient();

  // Gastos primero: los de crédito también caerían por cascada al borrar la
  // tarjeta, pero los sueltos no cuelgan de nada.
  for (const tabla of ["gastos", "ingresos", "tarjetas"] as const) {
    const { error } = await supabase.from(tabla).delete().not("id", "is", null);
    if (error) return { error: `No se pudieron borrar los ${tabla}: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return {};
}
