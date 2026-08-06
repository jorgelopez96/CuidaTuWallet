// src/components/carrusel-infinito.tsx
"use client";

import { Children, useEffect, useRef } from "react";

/** Tres tandas: una a cada lado de la del medio, que es donde vive el scroll. */
const TANDAS = 3;

/**
 * Carrusel horizontal sin principio ni fin. Repite los hijos tres veces y
 * mantiene el scroll en la tanda del medio: al salirse de ella salta una tanda
 * entera, que se ve idéntica, así que el salto es invisible y nunca se llega a
 * un borde.
 */
export function CarruselInfinito({ children }: { children: React.ReactNode }) {
  const pista = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);

  useEffect(() => {
    const nodo = pista.current;
    if (!nodo) return;

    const anchoDeTanda = () => nodo.scrollWidth / TANDAS;
    nodo.scrollLeft = anchoDeTanda();

    const alScrollear = () => {
      const tanda = anchoDeTanda();
      if (nodo.scrollLeft < tanda * 0.5) nodo.scrollLeft += tanda;
      else if (nodo.scrollLeft > tanda * 1.5) nodo.scrollLeft -= tanda;
    };

    nodo.addEventListener("scroll", alScrollear, { passive: true });
    return () => nodo.removeEventListener("scroll", alScrollear);
  }, [items.length]);

  return (
    <div
      ref={pista}
      // La barra de scroll se oculta con las propiedades de cada motor:
      // Tailwind no trae utilidad.
      className="flex gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {Array.from({ length: TANDAS }, (_, tanda) =>
        items.map((item, i) => (
          <div key={`${tanda}-${i}`} className="shrink-0">
            {item}
          </div>
        )),
      )}
    </div>
  );
}
