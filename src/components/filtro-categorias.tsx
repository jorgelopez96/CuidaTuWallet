// src/components/filtro-categorias.tsx
"use client";

import { useState } from "react";
import { enPesos } from "@/lib/formato";
import { CATEGORIAS } from "@/lib/catalogos";
import { estiloDeCategoria } from "@/components/categorias";
import { ListaGastos, type Gasto } from "@/components/lista-gastos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vacio } from "@/components/vacio";
import { ShoppingBasket } from "lucide-react";

const totalDe = (gastos: Gasto[]) => gastos.reduce((t, g) => t + Number(g.monto), 0);
const categoriaDe = (g: Gasto) => g.categoria?.trim() || "Otros";

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

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {CATEGORIAS.map((categoria) => {
          const { icono: Icono, color } = estiloDeCategoria(categoria);
          const suyos = gastos.filter((g) => categoriaDe(g) === categoria);
          const activa = elegidas.includes(categoria);

          return (
            <button
              key={categoria}
              type="button"
              onClick={() => alternar(categoria)}
              aria-pressed={activa}
              className="flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-all duration-200 hover:-translate-y-0.5"
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
              <span className="text-xs font-bold tabular-nums">
                {enPesos(totalDe(suyos))}
              </span>
            </button>
          );
        })}
      </div>

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
