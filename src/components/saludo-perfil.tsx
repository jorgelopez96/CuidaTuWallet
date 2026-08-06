// src/components/saludo-perfil.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { iniciales } from "@/components/user-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** Saludo con la foto en el encabezado mobile. Lleva a la pantalla de perfil. */
export function SaludoPerfil() {
  const { user } = useUser();
  const pathname = usePathname();
  const nombre = user?.fullName ?? user?.firstName ?? "";

  // Dentro del perfil la foto ya está grande en la pantalla: repetirla arriba
  // se ve como un error.
  if (pathname.startsWith("/perfil")) return null;

  return (
    <Link href="/perfil" className="flex items-center gap-2.5">
      <Avatar className="size-9">
        <AvatarImage src={user?.imageUrl} alt="" />
        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
          {iniciales(nombre)}
        </AvatarFallback>
      </Avatar>
      {/* Sin nombre todavía no saludamos con un hueco. */}
      <span className="truncate font-semibold">
        {nombre ? `Hola, ${nombre.split(" ")[0]}` : "Hola"}
      </span>
    </Link>
  );
}
