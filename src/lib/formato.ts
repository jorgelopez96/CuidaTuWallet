// src/lib/formato.ts

const pesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const enPesos = (monto: number) => pesos.format(monto);
