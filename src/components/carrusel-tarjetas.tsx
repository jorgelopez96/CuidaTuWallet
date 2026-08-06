// src/components/carrusel-tarjetas.tsx
"use client";

import { Children, useEffect, useRef, useState } from "react";

/**
 * Carrusel horizontal con scroll-snap nativo, al estilo de las billeteras: la
 * tarjeta del centro a escala completa y las vecinas más chicas y difuminadas.
 * El scroll lo maneja el navegador; el observer solo sirve para saber cuál está
 * enfocada y pintar los puntitos.
 */
export function CarruselTarjetas({ children }: { children: React.ReactNode }) {
  const pista = useRef<HTMLDivElement>(null);
  const [enfocada, setEnfocada] = useState(0);
  const tarjetas = Children.toArray(children);

  useEffect(() => {
    const nodo = pista.current;
    if (!nodo) return;

    const observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const indice = Number((entrada.target as HTMLElement).dataset.indice);
          if (Number.isInteger(indice)) setEnfocada(indice);
        }
      },
      // root = la pista, no el viewport: con el umbral alto solo dispara la que
      // está realmente centrada.
      { root: nodo, threshold: 0.75 },
    );

    for (const hijo of Array.from(nodo.children)) observer.observe(hijo);
    return () => observer.disconnect();
  }, [tarjetas.length]);

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={pista}
        // El ancho va en --tarjeta y el padding se deriva de él, para que la
        // primera y la última puedan centrarse. Con ancho y padding en
        // porcentaje no se puede: el % del ancho se mide contra el content box
        // (ya sin padding) y el del padding contra el scrollport, así que la
        // última quedaba corrida porque el scroll se acababa antes.
        // 72vw con techo de 20rem: menos que eso y el número no entra adentro.
        style={{ "--tarjeta": "min(20rem, 72vw)" } as React.CSSProperties}
        // La barra de scroll se oculta con las propiedades de cada motor:
        // Tailwind no trae utilidad.
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[calc((100%-var(--tarjeta))/2)] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tarjetas.map((tarjeta, i) => (
          <div
            key={i}
            data-indice={i}
            className={`w-[var(--tarjeta)] shrink-0 snap-center transition-all duration-300 ${
              i === enfocada
                ? "scale-100 opacity-100 blur-0"
                : "scale-90 opacity-60 blur-[2px]"
            }`}
          >
            {tarjeta}
          </div>
        ))}
      </div>

      {tarjetas.length > 1 && (
        <div className="flex justify-center gap-1.5" aria-hidden>
          {tarjetas.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === enfocada ? "w-5 bg-foreground" : "w-1.5 bg-foreground/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
