// src/components/logo-marca.tsx
import Image from "next/image";

/**
 * Logo oficial de la red de la tarjeta, desde `public/marcas/`.
 * `unoptimized` porque el optimizador de Next no procesa SVG: se sirve tal cual.
 *
 * Cada marca lleva su propia altura porque las proporciones originales van de
 * 3:1 (Visa) a 1:1 (Amex), y algunas se fuerzan a blanco: es el tratamiento
 * en reversa que usan las propias marcas sobre fondos oscuros.
 */

type Marca = {
  archivo: string;
  alto: string;
  ratio: number;
  enBlanco?: boolean;
  /** Texto debajo del símbolo, para las marcas cuyo logo es solo el ícono. */
  nombre?: string;
};

const MARCAS: Record<string, Marca> = {
  Visa: { archivo: "visa", alto: "h-6", ratio: 1000 / 324.68, enBlanco: true },
  Mastercard: {
    archivo: "mastercard",
    alto: "h-8",
    ratio: 1000 / 618,
    nombre: "MasterCard",
  },
  "American Express": { archivo: "amex", alto: "h-14", ratio: 1 },
  "Naranja X": { archivo: "naranja-x", alto: "h-7", ratio: 200 / 60, enBlanco: true },
  Cabal: { archivo: "cabal", alto: "h-9", ratio: 283 / 301 },
};

export function LogoMarca({ marca }: { marca: string }) {
  const info = MARCAS[marca];

  if (!info) {
    return (
      <span className="text-sm font-semibold uppercase tracking-wide text-white/80">
        {marca}
      </span>
    );
  }

  return (
    <span className="flex flex-col items-center gap-0.5">
      <Image
        src={`/marcas/${info.archivo}.svg`}
        alt={marca}
        width={Math.round(48 * info.ratio)}
        height={48}
        unoptimized
        // brightness(0) aplana el arte a negro e invert(1) lo lleva a blanco puro.
        className={`${info.alto} w-auto ${info.enBlanco ? "brightness-0 invert" : ""}`}
      />
      {info.nombre && (
        <span className="text-[11px] font-semibold leading-none tracking-tight text-white">
          {info.nombre}
        </span>
      )}
    </span>
  );
}
