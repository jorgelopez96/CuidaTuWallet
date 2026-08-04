// src/lib/resumen.test.ts
// Correlo con: npx tsx src/lib/resumen.test.ts
import assert from "node:assert/strict";
import {
  agruparPorCategoria,
  porCategoria,
  rangoDelMes,
  resumenMensual,
  total,
  totalesPorTitular,
} from "./resumen";

assert.equal(total([]), 0);
assert.equal(total([{ monto: "1500.50" }, { monto: 499.5 }]), 2000);

const r = resumenMensual([{ monto: 100 }], [{ monto: 30 }, { monto: "10" }]);
assert.deepEqual(r, { cobrado: 100, gastado: 40, disponible: 60 });

assert.deepEqual(
  totalesPorTitular([
    { monto: 100, es_propio: true },
    { monto: "50", es_propio: false },
    { monto: 25, es_propio: true },
  ]),
  { propios: 125, ajenos: 50 },
);
assert.deepEqual(totalesPorTitular([]), { propios: 0, ajenos: 0 });

// Agrupa, suma, ordena de mayor a menor, y null/""/espacios caen en "Otros".
assert.deepEqual(
  porCategoria([
    { categoria: "Super", monto: 10 },
    { categoria: null, monto: 5 },
    { categoria: "Super", monto: "40" },
    { categoria: "  ", monto: 1 },
  ]),
  [
    { categoria: "Super", monto: 50 },
    { categoria: "Otros", monto: 6 },
  ],
);
assert.deepEqual(porCategoria([]), []);

// Respeta el orden de CATEGORIAS ("Otros" último) y manda las desconocidas al final.
assert.deepEqual(
  agruparPorCategoria([
    { categoria: "Otros", monto: 1 },
    { categoria: "Transporte", monto: 2 },
    { categoria: "Vieja", monto: 3 },
    { categoria: null, monto: 4 },
    { categoria: "Suscripciones", monto: 5 },
  ]).map((g) => g.categoria),
  ["Suscripciones", "Transporte", "Otros", "Vieja"],
);
// Los sin categoría se juntan con "Otros", no arman un grupo aparte.
assert.equal(
  agruparPorCategoria([{ categoria: "Otros" }, { categoria: null }]).length,
  1,
);
assert.deepEqual(agruparPorCategoria([]), []);

// Diciembre: el mes siguiente rebalsa de año, y febrero bisiesto tiene 29.
assert.deepEqual(rangoDelMes(new Date(2026, 11, 15)), {
  desde: "2026-12-01",
  hasta: "2026-12-31",
});
assert.deepEqual(rangoDelMes(new Date(2028, 1, 3)), {
  desde: "2028-02-01",
  hasta: "2028-02-29",
});

console.info("resumen.ts ok");
