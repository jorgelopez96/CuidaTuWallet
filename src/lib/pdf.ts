// src/lib/pdf.ts
"use client";

/**
 * Saca el texto de un PDF en el navegador. unpdf se importa recién acá para que
 * pdf.js no entre en el bundle inicial: solo se descarga si subís un resumen.
 * El archivo nunca sale de la máquina.
 */
export async function textoDePdf(archivo: File): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(await archivo.arrayBuffer()));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}
