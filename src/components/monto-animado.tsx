// src/components/monto-animado.tsx
"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { enPesos } from "@/lib/formato";

/**
 * Cuenta desde 0 hasta el valor al montar. El SSR ya imprime el número final,
 * así que sin JS —o si la animación falla— igual se lee el monto correcto.
 */
export function MontoAnimado({
  valor,
  className = "",
}: {
  valor: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    const control = animate(0, valor, {
      duration: 0.85,
      ease: "easeOut",
      onUpdate: (v) => {
        nodo.textContent = enPesos(v);
      },
    });

    return () => control.stop();
  }, [valor]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {enPesos(valor)}
    </span>
  );
}
