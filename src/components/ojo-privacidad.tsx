// src/components/ojo-privacidad.tsx
"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CLAVE_PRIVACIDAD = "cuidatuwallet:montos-ocultos";

/**
 * Difumina los montos del dashboard. Marca una clase en <html> en vez de bajar
 * los importes a estado de cliente: así también alcanza a lo que rinde el
 * servidor, y qué ojo se ve lo decide el CSS —sin estado ni hidratación.
 */
export function OjoPrivacidad() {
  const alternar = () => {
    const oculto = document.documentElement.classList.toggle("privado");
    localStorage.setItem(CLAVE_PRIVACIDAD, oculto ? "1" : "0");
  };

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={alternar}
      aria-label="Ocultar o mostrar los montos"
    >
      <Eye className="[.privado_&]:hidden" />
      <EyeOff className="hidden [.privado_&]:block" />
    </Button>
  );
}
