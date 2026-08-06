// src/components/guia-rapida.tsx
"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { PASOS_GUIA } from "@/lib/pasos-guia";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Recorrido guiado por la app, paso a paso. El paso vuelve a cero cada vez que
 * se abre: la guía es para consultarla entera, no para dejarla a la mitad.
 */
export function GuiaRapida() {
  const [abierta, setAbierta] = useState(false);
  const [paso, setPaso] = useState(0);

  const { icono: Icono, titulo, detalle } = PASOS_GUIA[paso];
  const ultimo = paso === PASOS_GUIA.length - 1;

  function abrir(v: boolean) {
    setAbierta(v);
    if (v) setPaso(0);
  }

  return (
    <Dialog open={abierta} onOpenChange={abrir}>
      {/* Vive en el header, no flotando: abajo a la derecha chocaba con el
          botón de cargar gasto, y en mobile ahí va el nav. */}
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="rounded-full">
          <HelpCircle />
          Ayuda
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {/*
          La key remonta el bloque y vuelve a correr la entrada. Sin
          AnimatePresence a propósito: esperar la salida deja el modal vacío y
          lo hace saltar de alto. El min-h fija el piso para que los botones no
          se muevan entre pasos.
        */}
        <motion.div
          key={paso}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex min-h-40 flex-col gap-3"
        >
          <span className="flex size-11 items-center justify-center rounded-[14px] bg-primary/15 text-primary">
            <Icono className="size-5" />
          </span>
          <DialogTitle className="text-xl">{titulo}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {detalle}
          </DialogDescription>
        </motion.div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="flex gap-1.5" aria-hidden>
            {PASOS_GUIA.map((p, i) => (
              <span
                key={p.titulo}
                className={`h-1.5 rounded-full transition-all ${
                  i === paso ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/35"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {paso > 0 && (
              <Button variant="ghost" onClick={() => setPaso((p) => p - 1)}>
                <ArrowLeft /> Atrás
              </Button>
            )}
            <Button
              onClick={() => (ultimo ? setAbierta(false) : setPaso((p) => p + 1))}
            >
              {ultimo ? "Listo" : "Siguiente"}
              {!ultimo && <ArrowRight />}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Paso {paso + 1} de {PASOS_GUIA.length}
        </p>
      </DialogContent>
    </Dialog>
  );
}
