// src/app/(app)/_actions/gastos.ts
"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parsearMonto } from "@/lib/monto";
import { MEDIOS, type Medio } from "@/lib/catalogos";
import type { GastoDetectado } from "@/lib/resumen-parser";
import type { Resultado } from "./ingresos";

type Gasto = {
  descripcion: string;
  monto: number;
  fecha: string;
  medio_pago: Medio;
  categoria: string | null;
  tarjeta_id: string | null;
  es_propio: boolean;
  pagado: boolean;
  cuota_actual: number | null;
  cuotas_total: number | null;
};

function leerGasto(form: FormData): { error: string } | { datos: Gasto } {
  const descripcion = String(form.get("descripcion") ?? "").trim();
  const monto = parsearMonto(String(form.get("monto") ?? ""));
  const fecha = String(form.get("fecha") ?? "").trim();
  const medio_pago = String(form.get("medio_pago") ?? "") as Medio;
  const tarjeta_id = String(form.get("tarjeta_id") ?? "").trim() || null;
  const cuotas_total = Number(form.get("cuotas_total")) || null;
  const cuota_actual = Number(form.get("cuota_actual")) || null;

  if (!descripcion) return { error: "Poné una descripción." };
  if (!Number.isFinite(monto) || monto <= 0)
    return { error: "El monto tiene que ser un número mayor a 0." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: "Fecha inválida." };
  if (!MEDIOS.includes(medio_pago)) return { error: "Elegí un medio de pago." };

  // El check de la DB exige que crédito y tarjeta vayan siempre juntos.
  if ((medio_pago === "credito") !== Boolean(tarjeta_id))
    return { error: "Los gastos con crédito tienen que ir asociados a una tarjeta." };

  if ((cuota_actual === null) !== (cuotas_total === null))
    return { error: "Cargá las dos cuotas (actual y total) o ninguna." };
  if (cuota_actual !== null && cuotas_total !== null && cuota_actual > cuotas_total)
    return { error: "La cuota actual no puede ser mayor al total." };

  return {
    datos: {
      descripcion,
      monto,
      fecha,
      medio_pago,
      categoria: String(form.get("categoria") ?? "").trim() || null,
      tarjeta_id,
      es_propio: form.get("es_propio") !== "ajeno",
      // Lo que sale por crédito recién se paga cuando vence el resumen.
      pagado: medio_pago !== "credito",
      cuota_actual,
      cuotas_total,
    },
  };
}

export async function crearGasto(
  _previo: Resultado,
  form: FormData,
): Promise<Resultado> {
  const leido = leerGasto(form);
  if ("error" in leido) return { error: leido.error };

  const { error } = await createServerSupabaseClient()
    .from("gastos")
    .insert(leido.datos);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

/**
 * Alta en lote desde un resumen ya revisado por el usuario en la pantalla.
 * `vencimiento` es el mes al que imputan todos: una cuota se paga cuando vence
 * el resumen, no cuando se hizo la compra.
 *
 * Entran todos como propios y sin pagar: quién gastó qué y si el resumen ya se
 * pagó se corrigen después en la lista, que es donde se ve gasto por gasto.
 */
export async function importarGastos(
  tarjetaId: string,
  gastos: GastoDetectado[],
  vencimiento: string,
): Promise<Resultado & { importados?: number }> {
  if (!gastos.length) return { error: "No hay gastos para importar." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(vencimiento))
    return { error: "Fecha de vencimiento inválida." };

  const filas = gastos.map((g) => ({
    descripcion: g.descripcion,
    monto: g.monto,
    fecha: vencimiento,
    fecha_compra: g.fechaCompra,
    medio_pago: "credito" as Medio,
    categoria: null,
    tarjeta_id: tarjetaId,
    es_propio: true,
    pagado: false,
    cuota_actual: g.cuota_actual,
    cuotas_total: g.cuotas_total,
  }));

  const { error } = await createServerSupabaseClient().from("gastos").insert(filas);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { importados: filas.length };
}

/**
 * Marca pagado (o impago) todo un resumen: los gastos de esa tarjeta que vencen
 * el mismo día. Una tarjeta se paga entera, no gasto por gasto.
 */
export async function marcarResumenPagado(
  tarjetaId: string,
  vencimiento: string,
  pagado: boolean,
): Promise<Resultado> {
  const { error } = await createServerSupabaseClient()
    .from("gastos")
    .update({ pagado })
    .eq("tarjeta_id", tarjetaId)
    .eq("fecha", vencimiento);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

/** Pasa un gasto de tarjeta de propio a prestado a un tercero, o al revés. */
export async function cambiarTitular(
  id: string,
  esPropio: boolean,
): Promise<Resultado> {
  const { error } = await createServerSupabaseClient()
    .from("gastos")
    .update({ es_propio: esPropio })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

export async function borrarGasto(id: string): Promise<Resultado> {
  const { error } = await createServerSupabaseClient()
    .from("gastos")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}
