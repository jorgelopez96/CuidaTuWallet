// src/components/fondo-animado.tsx
"use client";

import { motion } from "motion/react";

/**
 * Fondo de toda la app: un gradiente base que se desplaza lento y cinco manchas
 * de color difuminadas. Va `fixed` detrás de todo —sidebar incluido— y el resto
 * de las superficies son translúcidas, así que esto se ve a través de la app.
 */

type Blob = {
  color: string;
  tamano: string;
  posicion: string;
  a: { x: number; y: number; scale: number }[];
  duracion: number;
};

const BLOBS: Blob[] = [
  {
    color: "bg-indigo-600/22",
    tamano: "size-[700px]",
    posicion: "top-0 right-0",
    a: [
      { x: 0, y: 0, scale: 1 },
      { x: 40, y: -30, scale: 1.06 },
      { x: -20, y: 20, scale: 0.96 },
    ],
    duracion: 16,
  },
  {
    color: "bg-emerald-600/16",
    tamano: "size-[600px]",
    posicion: "bottom-0 left-0",
    a: [
      { x: 0, y: 0, scale: 1 },
      { x: -35, y: 30, scale: 1.07 },
      { x: 25, y: -15, scale: 0.94 },
    ],
    duracion: 22,
  },
  {
    color: "bg-indigo-500/14",
    tamano: "size-[500px]",
    posicion: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    a: [
      { x: 0, y: 0, scale: 1 },
      { x: 15, y: -35, scale: 1.05 },
    ],
    duracion: 12,
  },
  {
    color: "bg-emerald-500/12",
    tamano: "size-[350px]",
    posicion: "top-1/4 left-1/4",
    a: [
      { x: 0, y: 0, scale: 1 },
      { x: -30, y: 25, scale: 1.06 },
    ],
    duracion: 19,
  },
  {
    color: "bg-indigo-400/12",
    tamano: "size-[300px]",
    posicion: "bottom-1/4 right-1/4",
    a: [
      { x: 0, y: 0, scale: 1 },
      { x: 30, y: -20, scale: 1.05 },
    ],
    duracion: 25,
  },
];

export function FondoAnimado() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(135deg,#f4f3ff_0%,#e9e6ff_50%,#f4f3ff_100%)] dark:bg-[linear-gradient(135deg,#0c0a20_0%,#130e2e_50%,#0c0a20_100%)]"
        style={{ backgroundSize: "200% 200%" }}
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 overflow-hidden">
        {BLOBS.map(({ color, tamano, posicion, a, duracion }, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-3xl ${color} ${tamano} ${posicion}`}
            animate={{
              x: a.map((p) => p.x),
              y: a.map((p) => p.y),
              scale: a.map((p) => p.scale),
            }}
            transition={{
              duration: duracion,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
