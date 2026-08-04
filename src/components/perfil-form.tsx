// src/components/perfil-form.tsx
"use client";

import { useActionState } from "react";
import { guardarPerfil } from "@/app/(app)/_actions/perfil";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PerfilForm({
  nombre,
  apellido,
  nacimiento,
}: {
  nombre: string;
  apellido: string;
  nacimiento: string;
}) {
  const [estado, enviar, pendiente] = useActionState(guardarPerfil, {});

  return (
    <form action={enviar} className="grid max-w-md gap-4">
      <div className="grid gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" defaultValue={nombre} required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="apellido">Apellido</Label>
        <Input id="apellido" name="apellido" defaultValue={apellido} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="nacimiento">Fecha de nacimiento</Label>
        <Input
          id="nacimiento"
          name="nacimiento"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          defaultValue={nacimiento}
        />
      </div>

      {estado.error && <p className="text-sm text-gasto">{estado.error}</p>}

      <Button type="submit" disabled={pendiente} className="w-fit">
        {pendiente ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
