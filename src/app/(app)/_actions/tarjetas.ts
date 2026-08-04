// src/app/(app)/_actions/tarjetas.ts
"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MARCAS, type Marca } from "@/lib/catalogos";
import type { Resultado } from "./ingresos";

export async function crearTarjeta(
  _previo: Resultado,
  form: FormData,
): Promise<Resultado> {
  const marca = String(form.get("marca") ?? "").trim();
  const banco = String(form.get("banco") ?? "").trim();
  const ultimos4 = String(form.get("ultimos4") ?? "").trim();

  if (!MARCAS.includes(marca as Marca))
    return { error: "Elegí una marca." };
  if (!/^\d{4}$/.test(ultimos4))
    return { error: "Los últimos 4 dígitos tienen que ser 4 números." };

  const { error } = await createServerSupabaseClient()
    .from("tarjetas")
    .insert({ marca, banco: banco || null, ultimos4 });
  if (error) return { error: error.message };

  revalidatePath("/tarjetas");
  return {};
}

/** Borra la tarjeta y, por el ON DELETE CASCADE, todos sus gastos. */
export async function borrarTarjeta(id: string): Promise<Resultado> {
  const { error } = await createServerSupabaseClient()
    .from("tarjetas")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/tarjetas");
  revalidatePath("/");
  return {};
}
