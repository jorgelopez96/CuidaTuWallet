// src/app/(app)/_actions/ingresos.ts
"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parsearMonto } from "@/lib/monto";

export type Resultado = { error?: string };

/** Valida lo que llega del form. La DB es el segundo cerrojo (checks + RLS). */
function leerIngreso(form: FormData) {
  const concepto = String(form.get("concepto") ?? "").trim();
  const monto = parsearMonto(String(form.get("monto") ?? ""));
  const fecha = String(form.get("fecha") ?? "").trim();

  if (!concepto) return { error: "Poné un concepto (sueldo, venta, etc.)." };
  if (!Number.isFinite(monto) || monto <= 0)
    return { error: "El monto tiene que ser un número mayor a 0." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: "Fecha inválida." };

  return { datos: { concepto, monto, fecha } };
}

export async function crearIngreso(
  _previo: Resultado,
  form: FormData,
): Promise<Resultado> {
  const leido = leerIngreso(form);
  if ("error" in leido) return { error: leido.error };

  const { error: falla } = await createServerSupabaseClient()
    .from("ingresos")
    .insert(leido.datos);
  if (falla) return { error: falla.message };

  revalidatePath("/");
  return {};
}

export async function borrarIngreso(id: string): Promise<Resultado> {
  const { error } = await createServerSupabaseClient()
    .from("ingresos")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  return {};
}
