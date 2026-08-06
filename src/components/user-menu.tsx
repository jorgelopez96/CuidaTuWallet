// src/components/user-menu.tsx
"use client";

import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";

/** JL de "Jorge López", J de "Jorge", "?" si todavía no cargó. */
export function iniciales(nombre: string | null | undefined) {
  const partes = (nombre ?? "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  return (partes[0][0] + (partes.at(-1)![0] ?? "")).toUpperCase().slice(0, 2);
}

/** Pie del sidebar de escritorio. En mobile el acceso al perfil es [[SaludoPerfil]]. */
export function UserMenu() {
  const { user } = useUser();
  const nombre = user?.fullName ?? user?.firstName ?? "";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg">
          <Avatar className="size-8 rounded-lg">
            {/* Si entró con Google, Clerk ya trae la foto. Si no, van las iniciales. */}
            <AvatarImage src={user?.imageUrl} alt="" />
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
              {iniciales(nombre)}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-medium">{nombre}</span>
            <span className="truncate text-xs text-muted-foreground">{email}</span>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/perfil">
            <User />
            Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <SignOutButton>
            <button className="w-full">
              <LogOut />
              Cerrar sesión
            </button>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
