// src/components/filtro-categorias.tsx
"use client";

import { useState } from "react";
import { ShoppingBasket } from "lucide-react";
import { enPesos } from "@/lib/formato";
import { CATEGORIAS } from "@/lib/catalogos";
import { estiloDeCategoria } from "@/components/categorias";
import { CarruselInfinito } from "@/components/carrusel-infinito";
import { ListaGastos, type Gasto } from "@/components/lista-gastos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vacio } from "@/components/vacio";

const totalDe = (gastos: Gasto[]) => gastos.reduce((t, g) => t + Number(g.monto), 0);
const categoriaDe = (g: Gasto) => g.categoria?.trim() || "Otros";

function Chip({
  categoria,
  total,
  activa,
  alTocar,
}: {
  categoria: string;
  total: number;
  activa: boolean;
  alTocar: () => void;
}) {
  const { icono: Icono, color } = estiloDeCategoria(categoria);

  return (
    <button
      type="button"
      onClick={alTocar}
      aria-pressed={activa}
      // w-28 fijo: en el carrusel no hay grilla que le dé el ancho, y así
      // todas miden lo mismo aunque el nombre sea largo.
      className="flex w-28 flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-all duration-200 hover:-translate-y-0.5 md:w-auto"
      style={{
        borderColor: activa ? color : "transparent",
        backgroundColor: `color-mix(in oklab, ${color} ${activa ? 22 : 10}%, transparent)`,
        color,
      }}
    >
      <Icono className="size-6" />
      <span className="text-xs font-semibold leading-tight text-foreground">
        {categoria}
      </span>
      <span className="text-xs font-bold tabular-nums">{enPesos(total)}</span>
    </button>
  );
}

/** Chips por categoría con su total. Tocás una y filtra; volvés a tocar y se apaga. */
export function FiltroCategorias({ gastos }: { gastos: Gasto[] }) {
  const [elegidas, setElegidas] = useState<string[]>([]);

  const alternar = (categoria: string) =>
    setElegidas((previas) =>
      previas.includes(categoria)
        ? previas.filter((c) => c !== categoria)
        : [...previas, categoria],
    );

  const visibles = elegidas.length
    ? gastos.filter((g) => elegidas.includes(categoriaDe(g)))
    : gastos;

  // Los mismos chips en las dos vistas: el carrusel los repite, la grilla no.
  const chips = CATEGORIAS.map((categoria) => (
    <Chip
      key={categoria}
      categoria={categoria}
      total={totalDe(gastos.filter((g) => categoriaDe(g) === categoria))}
      activa={elegidas.includes(categoria)}
      alTocar={() => alternar(categoria)}
    />
  ));

  return (
    <>
      {/* En mobile van en un carrusel sin fin; en escritorio entran las ocho. */}
      <div className="md:hidden">
        <CarruselInfinito>{chips}</CarruselInfinito>
      </div>
      <div className="hidden gap-3 md:grid md:grid-cols-4">{chips}</div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>
            {elegidas.length ? elegidas.join(", ") : "Todos los consumos"}
          </CardTitle>
          <span className="tabular-nums text-muted-foreground">
            {enPesos(totalDe(visibles))}
          </span>
        </CardHeader>
        <CardContent>
          {visibles.length ? (
            <ListaGastos gastos={visibles} />
          ) : (
            <Vacio
              icono={ShoppingBasket}
              titulo="Nada en esas categorías"
              detalle="Probá apagando algún filtro de arriba."
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
