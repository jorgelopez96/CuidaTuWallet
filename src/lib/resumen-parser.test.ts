// src/lib/resumen-parser.test.ts
// Correlo con: npx tsx src/lib/resumen-parser.test.ts
import assert from "node:assert/strict";
import { analizarResumen, parsearResumen } from "./resumen-parser";

// --- Formato Galicia (VISA y Amex comparten layout) -------------------------
// Líneas reales del resumen, con los comercios cambiados.
const galicia = `
CONSOLIDADO PESOS DÓLARES
SALDO ANTERIOR 431.857,59 0,00
03-07-26 SU PAGO EN PESOS -431.857,59
DETALLE DEL CONSUMO
FECHA REFERENCIA CUOTA COMPROBANTE PESOS DÓLARES
30-07-25 * ACADEMIA ONLINE 12/12 000575 48.563,33
16-06-26 * WWW.TIENDA.COM.AR 02/06 006391 26.609,66
20-07-26 * MERPAGO*COMERCIO 01/06 318304 16.866,35
TARJETA 0876 Total Consumos de JORGE LOPEZ 398.504,04 0,00
TOTAL A PAGAR 398.504,04 0,00
3 cuotas de $ 118278,25 (TNA Fija: 86,750% - TEA: 131,165%) *
Condiciones vigentes hasta el 3-08-26. Llame al 0810-666-2100
`;

const g = parsearResumen(galicia);

// Solo los 3 consumos: el pago negativo, los totales y la letra chica quedan afuera.
assert.equal(g.length, 3);

assert.deepEqual(g[0], {
  fechaCompra: "2025-07-30",
  descripcion: "ACADEMIA ONLINE",
  monto: 48563.33,
  cuota_actual: 12,
  cuotas_total: 12,
});

// El comprobante no se cuela en la descripción.
assert.ok(!g[1].descripcion.includes("006391"));
assert.equal(g[1].descripcion, "WWW.TIENDA.COM.AR");
assert.equal(g[1].cuota_actual, 2);
assert.equal(g[1].cuotas_total, 6);
assert.equal(g[2].monto, 16866.35);

// "TOTAL A PAGAR" y "SALDO ANTERIOR" no tienen fecha: no entran.
assert.ok(!g.some((x) => x.descripcion.includes("TOTAL")));
assert.ok(!g.some((x) => x.descripcion.includes("SALDO")));

// --- Encabezado: tarjeta y vencimiento --------------------------------------
const encabezado = `
25-Jun-26 06-Jul-26 23-Jul-26 03-Ago-26 20-Ago-26 01-Sep-26
DETALLE DEL CONSUMO
30-07-25 * ACADEMIA ONLINE 12/12 000575 48.563,33
TARJETA 0876 Total Consumos de JORGE LOPEZ 398.504,04 0,00
`;

const leido = analizarResumen(encabezado);
assert.equal(leido.ultimos4, "0876");
// De las seis fechas del encabezado, la cuarta es el vencimiento de este resumen.
assert.equal(leido.vencimiento, "2026-08-03");
assert.equal(leido.gastos.length, 1);

// Sin encabezado reconocible no inventa nada: queda en null y lo elige el usuario.
const sinEncabezado = analizarResumen("03/08/26  ALGO  1.000,00");
assert.equal(sinEncabezado.vencimiento, null);
assert.equal(sinEncabezado.ultimos4, null);

// --- Formato genérico (respaldo para texto pegado de otros bancos) ----------
const generico = parsearResumen(`
03/08/26    001234   SUPERMERCADO DIA              45.320,10
05/08/26    001235   SUSCRIPCION MUSICA  C.02/12    2.999,00
12/08/2026  001236   ESTACION SERVICIO             30.000,00
15/08/26    001240   SU PAGO EN PESOS            -120.000,00
`);

assert.equal(generico.length, 3);
assert.equal(generico[0].fechaCompra, "2026-08-03");
assert.equal(generico[1].cuota_actual, 2);
assert.equal(generico[1].cuotas_total, 12);
assert.equal(generico[2].fechaCompra, "2026-08-12"); // año de 4 dígitos

// --- Bordes ----------------------------------------------------------------
assert.deepEqual(parsearResumen("45/13/26  ALGO  1.000,00"), []); // fecha imposible
assert.deepEqual(parsearResumen("03/08/26  SALDO ANTERIOR"), []); // sin importe
assert.deepEqual(parsearResumen(""), []);

console.info("resumen-parser.ts ok");
