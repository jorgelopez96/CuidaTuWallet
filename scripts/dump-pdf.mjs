// scripts/dump-pdf.mjs — vuelca el texto de un PDF para inspeccionar formatos.
// Uso: node scripts/dump-pdf.mjs "ruta/al/resumen.pdf"
import { readFile } from "node:fs/promises";
import { extractText, getDocumentProxy } from "unpdf";

const buf = new Uint8Array(await readFile(process.argv[2]));
const { totalPages, text } = await extractText(await getDocumentProxy(buf), {
  mergePages: true,
});
console.log("PAGINAS:", totalPages);
console.log(text);
