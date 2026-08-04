// scripts/probar-resumen.mjs — corre el parser contra un PDF real, sin tocar la DB.
// Uso: npx tsx scripts/probar-resumen.mjs "ruta/al/resumen.pdf"
import { readFile } from "node:fs/promises";
import { extractText, getDocumentProxy } from "unpdf";
import { analizarResumen } from "../src/lib/resumen-parser.ts";

const buf = new Uint8Array(await readFile(process.argv[2]));
const { text } = await extractText(await getDocumentProxy(buf), { mergePages: true });

const { gastos, ultimos4, vencimiento } = analizarResumen(text);
const suma = gastos.reduce((t, g) => t + g.monto, 0);

console.log(`tarjeta: ${ultimos4}   vencimiento: ${vencimiento}`);
console.log(`detectados: ${gastos.length}   suma: ${suma.toFixed(2)}`);
