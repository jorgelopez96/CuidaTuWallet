// src/components/transicion-pagina.tsx
"use client";

import { usePathname } from "next/navigation";
import { motion } from "motion/react";

/**
 * Fade + slide corto al entrar a cada sección. La `key` es el pathname: al
 * cambiar de ruta React remonta el bloque y la animación vuelve a correr.
 */
export function TransicionPagina({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-1 flex-col gap-6"
    >
      {children}
    </motion.div>
  );
}
