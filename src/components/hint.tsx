// src/components/hint.tsx
"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const clave = (id: string) => `cw:hint:${id}`;
const sinSuscripcion = () => () => {};

/** Pista que se muestra una sola vez por sección. Queda marcada en localStorage. */
export function Hint({ id, children }: { id: string; children: React.ReactNode }) {
  const [cerrado, setCerrado] = useState(false);
  const yaVisto = useSyncExternalStore(
    sinSuscripcion,
    () => localStorage.getItem(clave(id)) === "1",
    () => true, // en el server lo ocultamos: evita que parpadee antes de hidratar
  );

  if (yaVisto || cerrado) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">
      <p className="flex-1">{children}</p>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Entendido"
        className="size-6 shrink-0"
        onClick={() => {
          localStorage.setItem(clave(id), "1");
          setCerrado(true);
        }}
      >
        <X />
      </Button>
    </div>
  );
}
