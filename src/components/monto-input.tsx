// src/components/monto-input.tsx
"use client";

import { useState } from "react";
import { formatearMonto } from "@/lib/monto";
import { Input } from "@/components/ui/input";

/** Muestra 1.500.000 mientras tipeás. El server lo interpreta con parsearMonto(). */
export function MontoInput({ id = "monto", name = "monto" }: { id?: string; name?: string }) {
  const [valor, setValor] = useState("");

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        name={name}
        value={valor}
        onChange={(e) => setValor(formatearMonto(e.target.value))}
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        required
        className="pl-7 tabular-nums"
      />
    </div>
  );
}
