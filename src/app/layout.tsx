// src/app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { Geist_Mono, Nunito_Sans } from "next/font/google";
import { FondoAnimado } from "@/components/fondo-animado";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CuidaTuWallet",
  description: "Control de gastos e ingresos mensuales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Antes de pintar, para que los montos no se vean un instante. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{localStorage.getItem("cuidatuwallet:montos-ocultos")==="1"&&document.documentElement.classList.add("privado")}catch{}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <FondoAnimado />
          <ClerkProvider localization={esES}>
            <TooltipProvider>{children}</TooltipProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
