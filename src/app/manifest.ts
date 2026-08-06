// src/app/manifest.ts
// Next lo sirve en /manifest.webmanifest. Es lo que hace que Chrome ofrezca
// "Instalar app" en Android, y también el insumo de Bubblewrap para armar el APK.

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CuidaTuWallet",
    short_name: "CuidaTuWallet",
    description: "Control de gastos e ingresos mensuales",
    lang: "es-AR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    // El fondo del logo, para que el splash no pegue un flash blanco al abrir.
    background_color: "#110662",
    theme_color: "#110662",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icono-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
