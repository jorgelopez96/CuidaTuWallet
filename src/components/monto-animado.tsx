// src/components/monto-animado.tsx
"use client";

import { useEffect, useRef } from "react";
import { enPesos } from "@/lib/formato";

const DURACION = 850;

/**
 * Cuenta desde 0 hasta el valor al montar. El SSR ya imprime el número final,
 * así que sin JS —o si la animación falla— igual se lee el monto correcto.
 * A mano con rAF: son diez líneas y evita bajar una librería de animación.
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

    const desde = performance.now();
    let cuadro = 0;

    const paso = (ahora: number) => {
      const t = Math.min(1, (ahora - desde) / DURACION);
      nodo.textContent = enPesos(valor * (1 - (1 - t) ** 3));
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };

    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {enPesos(valor)}
    </span>
  );
}
