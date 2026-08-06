// scripts/generar-iconos.mjs
// Genera los íconos del manifest a partir de public/logo.png.
// Correlo con: node scripts/generar-iconos.mjs
//
// El maskable va aparte porque Android recorta el ícono en círculo o squircle
// según el launcher: solo garantiza el 80% central. Escalar el logo a ese 80%
// sobre el mismo fondo es lo que evita que le corte las esquinas a la billetera.

import sharp from "sharp";

const ORIGEN = "public/logo.png";
const FONDO = { r: 0x11, g: 0x06, b: 0x62, alpha: 1 };
const ZONA_SEGURA = 0.8;

// A paleta y compresión máxima: Android los baja crudos al instalar, sin pasar
// por el optimizador de imágenes de Next. Un ícono no pierde nada visible.
const PNG = { compressionLevel: 9, palette: true, effort: 10 };

await sharp(ORIGEN).resize(192, 192).png(PNG).toFile("public/icono-192.png");
await sharp(ORIGEN).resize(512, 512).png(PNG).toFile("public/icono-512.png");

const lado = Math.round(512 * ZONA_SEGURA);
const margen = Math.round((512 - lado) / 2);

await sharp({ create: { width: 512, height: 512, channels: 4, background: FONDO } })
  .composite([
    { input: await sharp(ORIGEN).resize(lado, lado).toBuffer(), top: margen, left: margen },
  ])
  .png(PNG)
  .toFile("public/icono-maskable-512.png");

console.info(`iconos generados (zona segura: ${lado}px de 512)`);
