// src/components/perfil-menu.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignOutButton, useClerk, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  Moon,
  ShieldCheck,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { iniciales } from "@/components/user-menu";
import { BorrarDatos } from "@/components/borrar-datos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const FILA =
  "flex w-full items-center gap-4 rounded-xl px-2 py-3.5 text-left transition-colors hover:bg-accent";

/** `icono` va como nodo y no como componente: la fila de tema necesita dos. */
function Fila({
  icono,
  children,
  tono = "normal",
}: {
  icono: React.ReactNode;
  children: React.ReactNode;
  tono?: "normal" | "peligro";
}) {
  return (
    <>
      <span className={`shrink-0 ${tono === "peligro" ? "text-gasto" : ""}`}>
        {icono}
      </span>
      <span className={`flex-1 ${tono === "peligro" ? "text-gasto" : ""}`}>
        {children}
      </span>
    </>
  );
}

/** Pantalla de perfil: la foto, los accesos de la cuenta y el cierre de sesión. */
export function PerfilMenu() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();

  const nombre = user?.fullName ?? user?.firstName ?? "";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const oscuro = resolvedTheme === "dark";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Volver"
          onClick={() => router.back()}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-semibold">Perfil</h1>
      </div>

      <div className="flex flex-col items-center gap-3 py-8">
        <div className="relative">
          {/* Resplandor difuminado con los mismos índigo y esmeralda de las
              manchas del fondo, en vez de un anillo duro alrededor de la foto. */}
          <div
            aria-hidden
            className="absolute -inset-5 rounded-full bg-[radial-gradient(circle_at_30%_25%,var(--chart-1),transparent_62%),radial-gradient(circle_at_75%_80%,var(--ingreso),transparent_62%)] opacity-55 blur-2xl"
          />
          <Avatar className="relative size-28 shadow-2xl">
            <AvatarImage src={user?.imageUrl} alt="" />
            <AvatarFallback className="bg-primary text-2xl font-semibold text-primary-foreground">
              {iniciales(nombre)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold">{nombre}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>

        {/* Clerk ya resuelve la subida y el recorte. Como texto y no como
            pastilla sobre la foto: no le tapa la cara y se entiende igual. */}
        <button
          onClick={() => openUserProfile()}
          className="flex items-center gap-1.5 rounded-full bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md transition-colors hover:text-foreground"
        >
          <Camera className="size-3.5" />
          Cambiar foto
        </button>
      </div>

      <nav className="flex flex-col">
        <Link href="/perfil/datos" className={FILA}>
          <Fila icono={<User className="size-5" />}>Datos personales</Fila>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>

        <button onClick={() => openUserProfile()} className={FILA}>
          <Fila icono={<ShieldCheck className="size-5" />}>Claves y seguridad</Fila>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>

        {/*
          El tema se muestra con CSS y no con `resolvedTheme`: en el servidor ese
          valor todavía no existe, así que decidir el ícono en JS rompía la
          hidratación. Mismo truco que ThemeToggle.
        */}
        <button onClick={() => setTheme(oscuro ? "light" : "dark")} className={FILA}>
          <Fila
            icono={
              <>
                <Sun className="size-5 dark:hidden" />
                <Moon className="hidden size-5 dark:block" />
              </>
            }
          >
            Apariencia
          </Fila>
          <span className="text-sm text-muted-foreground">
            <span className="dark:hidden">Claro</span>
            <span className="hidden dark:inline">Oscuro</span>
          </span>
        </button>

        <BorrarDatos>
          <button className={FILA}>
            <Fila icono={<Trash2 className="size-5" />} tono="peligro">
              Borrar datos de la app
            </Fila>
          </button>
        </BorrarDatos>
      </nav>

      <div className="mt-auto py-8 text-center">
        <SignOutButton>
          <Button variant="link" className="text-primary">
            Cerrar sesión
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
