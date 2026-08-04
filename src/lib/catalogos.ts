// src/lib/catalogos.ts
// Van acá y no en los "use server": esos módulos solo pueden exportar funciones
// async — cualquier otra cosa llega al cliente como un stub, no como el valor.

export const MARCAS = [
  "Visa",
  "Mastercard",
  "American Express",
  "Naranja X",
  "Cabal",
  "Otra",
] as const;

export const MEDIOS = ["efectivo", "debito", "transferencia", "credito"] as const;

export const NOMBRE_MEDIO: Record<Medio, string> = {
  efectivo: "Efectivo",
  debito: "Débito",
  transferencia: "Transferencia",
  credito: "Crédito",
};

/** "Otros" va último a propósito: es el cajón de sastre en los listados. */
export const CATEGORIAS = [
  "Suscripciones",
  "Supermercado",
  "Transporte",
  "Otros",
] as const;

export type Marca = (typeof MARCAS)[number];
export type Medio = (typeof MEDIOS)[number];
export type Categoria = (typeof CATEGORIAS)[number];
