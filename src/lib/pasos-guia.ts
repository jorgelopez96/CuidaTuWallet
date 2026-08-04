// src/lib/pasos-guia.ts
import {
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  ShoppingBasket,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type PasoGuia = {
  icono: LucideIcon;
  titulo: string;
  detalle: string;
};

/** El recorrido de la guía, en el orden en que conviene aprender la app. */
export const PASOS_GUIA: PasoGuia[] = [
  {
    icono: Wallet,
    titulo: "Bienvenido a CuidaTuWallet",
    detalle:
      "En un minuto te muestro cómo llevar el mes: cuánto entra, cuánto sale y cuánto te queda de verdad.",
  },
  {
    icono: LayoutDashboard,
    titulo: "Inicio",
    detalle:
      "Acá ves cuánto entró y cuánto gastaste este mes. El disponible se calcula restando todos los gastos —sueltos y de tarjeta— a tus ingresos. Cargá tu sueldo o una venta con el botón de arriba a la derecha.",
  },
  {
    icono: CalendarClock,
    titulo: "Lo que viene",
    detalle:
      "El gráfico del Inicio proyecta las cuotas que ya tenés comprometidas, de este mes en adelante. Sirve para saber con cuánto vas a contar dentro de tres meses, no solo hoy.",
  },
  {
    icono: CreditCard,
    titulo: "Tarjetas",
    detalle:
      "Cargá tus tarjetas y entrá a cada una para ver sus gastos. Podés subir el PDF del resumen y que los consumos se carguen solos: se lee al vuelo y no se guarda en ningún lado. Marcá cuáles son tuyos y cuáles de terceros.",
  },
  {
    icono: ShoppingBasket,
    titulo: "Consumos",
    detalle:
      "Los gastos sueltos van acá: verdulería, SUBE, Netflix, un Uber. Se agrupan por categoría y podés filtrar tocando los chips. Todo lo que cargues descuenta del disponible del mes.",
  },
  {
    icono: User,
    titulo: "Perfil",
    detalle:
      "Abajo a la izquierda, en tu nombre. Editás tus datos y cerrás sesión. Si querés volver a ver esta guía, tocá el signo de pregunta cuando quieras.",
  },
];
