// src/components/guia-rapida.tsx
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  ShoppingBasket,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Paso = { icono: LucideIcon; titulo: string; detalle: string };

const PASOS: Paso[] = [
  {
    icono: LayoutDashboard,
    titulo: "Inicio",
    detalle:
      "Cargá tus ingresos del mes. El disponible se calcula solo: ingresos menos todos los gastos.",
  },
  {
    icono: CreditCard,
    titulo: "Tarjetas",
    detalle:
      "Una tarjeta por cada plástico. Entrá al detalle para cargar gastos a mano o subir el PDF del resumen: los consumos se cargan solos.",
  },
  {
    icono: ShoppingBasket,
    titulo: "Consumos",
    detalle:
      "Lo que pagás fuera de la tarjeta de crédito. Se agrupa por categoría y podés filtrar tocando los chips.",
  },
  {
    icono: User,
    titulo: "Perfil",
    detalle: "Abajo a la izquierda, en tu nombre. Editás tus datos y cerrás sesión.",
  },
];

/**
 * Guía flotante. El estado vive en memoria a propósito: al recargar la página
 * vuelve a aparecer, así siempre está a mano sin ensuciar el localStorage.
 */
export function GuiaRapida() {
  const [visible, setVisible] = useState(true);
  const [abierta, setAbierta] = useState(false);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {abierta && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border bg-popover p-5 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Guía rápida</p>
                <p className="text-xs text-muted-foreground">
                  Cómo se usa CuidaTuWallet
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cerrar guía"
                onClick={() => setAbierta(false)}
              >
                <X />
              </Button>
            </div>

            <ul className="mt-4 flex flex-col gap-4">
              {PASOS.map(({ icono: Icono, titulo, detalle }) => (
                <li key={titulo} className="flex gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icono className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{titulo}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {detalle}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setVisible(false)}
              className="mt-4 w-full text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              Ocultar hasta recargar la página
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        aria-label={abierta ? "Cerrar guía rápida" : "Abrir guía rápida"}
        aria-expanded={abierta}
        onClick={() => setAbierta((a) => !a)}
        className="size-12 rounded-full shadow-lg shadow-primary/25"
      >
        {abierta ? <X className="size-5" /> : <HelpCircle className="size-5" />}
      </Button>
    </div>
  );
}
