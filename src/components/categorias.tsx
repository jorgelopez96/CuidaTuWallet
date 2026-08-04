// src/components/categorias.tsx
import { Bus, Package, ShoppingCart, Tv, type LucideIcon } from "lucide-react";

type Estilo = { icono: LucideIcon; color: string };

/** Cada categoría con su ícono y su color. Se usa en la tabla y en la torta. */
const ESTILOS: Record<string, Estilo> = {
  Suscripciones: { icono: Tv, color: "var(--chart-4)" },
  Supermercado: { icono: ShoppingCart, color: "var(--chart-2)" },
  Transporte: { icono: Bus, color: "var(--chart-3)" },
  Otros: { icono: Package, color: "var(--chart-5)" },
};

const POR_DEFECTO: Estilo = { icono: Package, color: "var(--chart-1)" };

export const estiloDeCategoria = (categoria?: string | null): Estilo =>
  ESTILOS[categoria?.trim() ?? ""] ?? POR_DEFECTO;

/** Pastilla con el ícono de la categoría, teñida con su color. */
export function IconoCategoria({
  categoria,
  className = "",
}: {
  categoria?: string | null;
  className?: string;
}) {
  const { icono: Icono, color } = estiloDeCategoria(categoria);

  return (
    <span
      aria-hidden
      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${className}`}
      style={{ backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
    >
      <Icono className="size-4" />
    </span>
  );
}
