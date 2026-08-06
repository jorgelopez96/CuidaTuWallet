// src/components/nav-mobile.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  PiggyBank,
  Plus,
  ReceiptText,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";
import { GastoForm } from "@/components/gasto-form";

type Seccion = { href: string; label: string; icon: LucideIcon };

// Dos a cada lado del botón central: el mismo orden que el sidebar de escritorio.
const IZQUIERDA: Seccion[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/ingresos", label: "Ingresos", icon: PiggyBank },
];

const DERECHA: Seccion[] = [
  { href: "/tarjetas", label: "Tarjetas", icon: CreditCard },
  { href: "/consumos", label: "Consumos", icon: ShoppingBasket },
];

function Item({ href, label, icon: Icono, activo }: Seccion & { activo: boolean }) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      // foreground y no blanco puro: en el tema claro, blanco sobre la barra
      // clara no se vería. En oscuro —el tema por defecto— es blanco igual.
      className={`flex flex-1 flex-col items-center gap-1 py-1 text-[11px] leading-none transition-colors ${
        activo ? "font-semibold text-foreground" : "text-foreground/60"
      }`}
    >
      <Icono className="size-5" />
      {label}
    </Link>
  );
}

/**
 * Barra inferior estilo billetera: las cuatro secciones con el alta de gasto
 * destacada al medio. Solo en mobile; en escritorio manda el sidebar.
 */
export function NavMobile() {
  const pathname = usePathname();
  const esActiva = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 flex items-end rounded-[28px] border bg-card/85 px-2 pb-2 pt-1.5 shadow-lg backdrop-blur-md md:hidden">
      {IZQUIERDA.map((s) => (
        <Item key={s.href} {...s} activo={esActiva(s.href)} />
      ))}

      {/* Ticket con un más, y la etiqueta abajo como los otros cuatro: un "+"
          solo y sin texto no dice qué se agrega. -mt-7 lo levanta por encima
          de la barra; por eso la barra no lleva overflow-hidden. Sin anillo:
          flota por la sombra, y el tono sale de la misma superficie del nav
          para no gritar. El color queda solo en la pastilla del más. */}
      <div className="flex flex-1 flex-col items-center gap-1">
        <GastoForm>
          <button
            aria-label="Cargar gasto"
            className="relative -mt-7 flex size-14 items-center justify-center rounded-full bg-gradient-to-b from-card to-accent text-foreground shadow-[0_10px_22px_-6px_rgb(0_0_0/0.55)] transition-transform active:scale-95"
          >
            <ReceiptText className="size-6" />
            <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Plus className="size-3" strokeWidth={3} />
            </span>
          </button>
        </GastoForm>
        <span className="text-[11px] font-semibold leading-none text-foreground">
          Gasto
        </span>
      </div>

      {DERECHA.map((s) => (
        <Item key={s.href} {...s} activo={esActiva(s.href)} />
      ))}
    </nav>
  );
}
