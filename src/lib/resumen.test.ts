// src/lib/resumen.test.ts
// Correlo con: npx tsx src/lib/resumen.test.ts
import assert from "node:assert/strict";
import {
  agruparPorCategoria,
  agruparPorDia,
  faltaPagar,
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

// Cuota 4 de 12: quedan 8 por pagar.
assert.equal(faltaPagar({ monto: 138400, cuota_actual: 4, cuotas_total: 12 }), 1107200);
// La última cuota no deja nada pendiente.
assert.equal(faltaPagar({ monto: 5000, cuota_actual: 6, cuotas_total: 6 }), 0);
// Un gasto sin cuotas no tiene pendiente que mostrar.
assert.equal(faltaPagar({ monto: 5000, cuota_actual: null, cuotas_total: null }), null);
// Datos inconsistentes (cuota mayor al total) no devuelven negativo.
assert.equal(faltaPagar({ monto: 5000, cuota_actual: 9, cuotas_total: 6 }), 0);

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

// Agrupa por día, del más reciente al más viejo, sin perder filas.
const porDia = agruparPorDia([
  { fecha: "2026-08-01", d: "a" },
  { fecha: "2026-08-03", d: "b" },
  { fecha: "2026-08-01", d: "c" },
]);
assert.deepEqual(porDia.map((g) => g.fecha), ["2026-08-03", "2026-08-01"]);
assert.equal(porDia[1].gastos.length, 2);
assert.deepEqual(agruparPorDia([]), []);

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
