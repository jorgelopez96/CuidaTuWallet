// src/hooks/use-mobile.ts
import * as React from "react";

// Mismo corte que los breakpoints `md:` de Tailwind, así el sidebar y las
// grillas cambian de forma juntos.
const MOBILE_BREAKPOINT = 768;

const consulta = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

function suscribir(alCambiar: () => void) {
  const mql = consulta();
  mql.addEventListener("change", alCambiar);
  return () => mql.removeEventListener("change", alCambiar);
}

/**
 * Versión propia del hook de shadcn: el original hacía setState dentro de un
 * efecto, lo que renderiza de más y el linter lo marca como error.
 * useSyncExternalStore lee el media query directo y evita el doble render.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    suscribir,
    () => consulta().matches,
    () => false, // en el server no hay ventana: asumimos escritorio
  );
}
