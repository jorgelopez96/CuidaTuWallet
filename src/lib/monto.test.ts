// src/lib/monto.test.ts
// Correlo con: npx tsx src/lib/monto.test.ts
import assert from "node:assert/strict";
import { formatearMonto, parsearMonto } from "./monto";

// Tipeando de a un dígito: 1 → 15 → 150 … → 1.500.000
assert.equal(formatearMonto("1"), "1");
assert.equal(formatearMonto("150"), "150");
assert.equal(formatearMonto("1500"), "1.500");
assert.equal(formatearMonto("1500000"), "1.500.000");

// Reformatea lo que ya tenía puntos, sin duplicarlos.
assert.equal(formatearMonto("1.500.000"), "1.500.000");
// Basura tipeada de más se ignora.
assert.equal(formatearMonto("$ 1.500 abc"), "1.500");
assert.equal(formatearMonto(""), "");
// Ceros a la izquierda no se acumulan, pero un 0 solo sobrevive.
assert.equal(formatearMonto("007"), "7");
assert.equal(formatearMonto("0"), "0");
// Decimales: se mantiene la coma mientras tipea y se corta en 2.
assert.equal(formatearMonto("1500,"), "1.500,");
assert.equal(formatearMonto("1500,5"), "1.500,5");
assert.equal(formatearMonto("1500,567"), "1.500,56");

assert.equal(parsearMonto("1.500.000"), 1500000);
assert.equal(parsearMonto("1.500,50"), 1500.5);
assert.equal(parsearMonto("120000"), 120000);
assert.ok(Number.isNaN(parsearMonto("")));
assert.ok(Number.isNaN(parsearMonto("abc")));

console.info("monto.ts ok");
