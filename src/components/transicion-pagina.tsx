// src/components/transicion-pagina.tsx
"use client";

import { usePathname } from "next/navigation";

/**
 * Fade + slide corto al entrar a cada sección. La `key` es el pathname: al
 * cambiar de ruta React remonta el bloque y la animación vuelve a correr.
 */
export function TransicionPagina({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // El perfil entra deslizándose desde la derecha, como una pantalla apilada;
  // las secciones del nav entran de abajo, que se lee como cambiar de pestaña.
  const desdeElCostado = pathname.startsWith("/perfil");

  return (
    <div
      key={pathname}
      className={`flex flex-1 flex-col gap-6 ${
        desdeElCostado ? "entra-desde-el-costado" : "entra-desde-abajo"
      }`}
    >
      {children}
    </div>
  );
}
