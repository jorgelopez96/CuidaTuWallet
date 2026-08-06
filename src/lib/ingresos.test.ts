// src/lib/ingresos.test.ts
// Correlo con: npx tsx src/lib/ingresos.test.ts
import assert from "node:assert/strict";
import {
  esActivo,
  historialPorMes,
  ingresosDeMes,
  vigenteEnMes,
} from "./ingresos";

const puntual = { fecha: "2026-06-10", recurrente: false, baja_el: null };
const sueldo = { fecha: "2026-03-28", recurrente: true, baja_el: null };
const alquiler = { fecha: "2026-01-05", recurrente: true, baja_el: "2026-05-20" };

// --- vigenteEnMes ----------------------------------------------------------
// Un puntual cuenta solo en el mes de su fecha.
assert.equal(vigenteEnMes(puntual, "2026-06"), true);
assert.equal(vigenteEnMes(puntual, "2026-07"), false);
assert.equal(vigenteEnMes(puntual, "2026-05"), false);

// Un recurrente sin baja cuenta desde su alta en adelante, para siempre.
assert.equal(vigenteEnMes(sueldo, "2026-03"), true);
assert.equal(vigenteEnMes(sueldo, "2026-08"), true);
assert.equal(vigenteEnMes(sueldo, "2027-12"), true);
// Pero no antes de darse de alta.
assert.equal(vigenteEnMes(sueldo, "2026-02"), false);

// El día del mes no importa: dado de alta el 28, cuenta el mes entero.
assert.equal(vigenteEnMes({ ...sueldo, fecha: "2026-03-01" }, "2026-03"), true);

// Un recurrente dado de baja cuenta hasta el mes de la baja inclusive.
assert.equal(vigenteEnMes(alquiler, "2026-04"), true);
assert.equal(vigenteEnMes(alquiler, "2026-05"), true);
assert.equal(vigenteEnMes(alquiler, "2026-06"), false);

// Alta y baja en el mismo mes: cuenta ese mes y ninguno más.
const fugaz = { fecha: "2026-02-03", recurrente: true, baja_el: "2026-02-25" };
assert.equal(vigenteEnMes(fugaz, "2026-02"), true);
assert.equal(vigenteEnMes(fugaz, "2026-03"), false);

// --- ingresosDeMes ---------------------------------------------------------
const todos = [puntual, sueldo, alquiler];
assert.deepEqual(ingresosDeMes(todos, "2026-06"), [puntual, sueldo]);
assert.deepEqual(ingresosDeMes(todos, "2026-04"), [sueldo, alquiler]);
assert.deepEqual(ingresosDeMes(todos, "2025-12"), []);
assert.deepEqual(ingresosDeMes([], "2026-06"), []);

// --- esActivo --------------------------------------------------------------
// Un recurrente sin baja está activo, no importa cuándo se dio de alta.
assert.equal(esActivo(sueldo, "2026-08"), true);
// Uno dado de baja es historial aunque la baja sea de este mes.
assert.equal(esActivo(alquiler, "2026-05"), false);
// Un puntual está activo solo durante su mes.
assert.equal(esActivo(puntual, "2026-06"), true);
assert.equal(esActivo(puntual, "2026-07"), false);

// --- historialPorMes -------------------------------------------------------
// Se agrupa por el mes de cierre: la baja si es recurrente, la fecha si fue puntual.
const grupos = historialPorMes([puntual, alquiler]);
assert.deepEqual(grupos.map((g) => g.mes), ["2026-06", "2026-05"]);
assert.deepEqual(grupos[0].ingresos, [puntual]);
assert.deepEqual(grupos[1].ingresos, [alquiler]);
assert.deepEqual(historialPorMes([]), []);

console.info("ingresos.ts ok");
