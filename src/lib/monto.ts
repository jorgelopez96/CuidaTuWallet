// src/lib/monto.ts
// Formato es-AR: punto para miles, coma para decimales. "1.500.000,50"

/** Lo que se ve mientras tipeás: agrupa de a tres y deja como mucho 2 decimales. */
export function formatearMonto(texto: string): string {
  const limpio = texto.replace(/[^\d,]/g, "");
  const [entera = "", ...resto] = limpio.split(",");
  const conPuntos = entera.replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  if (!resto.length) return conPuntos;
  return `${conPuntos},${resto.join("").slice(0, 2)}`;
}

/** Lo que se guarda: NaN si el texto no representa un número usable. */
export function parsearMonto(texto: string): number {
  const limpio = String(texto).replace(/\./g, "").replace(",", ".").trim();
  return limpio === "" ? NaN : Number(limpio);
}
