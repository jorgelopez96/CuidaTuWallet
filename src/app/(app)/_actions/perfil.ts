// src/app/(app)/_actions/perfil.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Resultado } from "./ingresos";

export async function guardarPerfil(
  _previo: Resultado,
  form: FormData,
): Promise<Resultado> {
  const { userId } = await auth.protect();

  const nombre = String(form.get("nombre") ?? "").trim();
  const apellido = String(form.get("apellido") ?? "").trim();
  const nacimiento = String(form.get("nacimiento") ?? "").trim();

  if (!nombre) return { error: "El nombre no puede quedar vacío." };
  if (nacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(nacimiento))
    return { error: "Fecha de nacimiento inválida." };

  try {
    const clerk = await clerkClient();
    await clerk.users.updateUser(userId, {
      firstName: nombre,
      lastName: apellido,
      publicMetadata: { nacimiento: nacimiento || null },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo guardar." };
  }

  revalidatePath("/", "layout");
  return {};
}
