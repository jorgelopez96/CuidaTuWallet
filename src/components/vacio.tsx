// src/components/vacio.tsx
import type { LucideIcon } from "lucide-react";

/** Estado vacío: ícono, una frase amable y —si hace falta— la acción a mano. */
export function Vacio({
  icono: Icono,
  titulo,
  detalle,
  children,
}: {
  icono: LucideIcon;
  titulo: string;
  detalle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Icono className="size-7" />
      </span>
      <p className="font-medium">{titulo}</p>
      {detalle && (
        <p className="max-w-sm text-sm text-muted-foreground">{detalle}</p>
      )}
      {children}
    </div>
  );
}
