// src/components/app-sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, LayoutDashboard, PiggyBank, ShoppingBasket } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Perfil no va acá: se entra desde el menú del usuario, en el pie.
const secciones = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-chart-1" },
  { href: "/ingresos", label: "Ingresos", icon: PiggyBank, color: "text-chart-2" },
  { href: "/tarjetas", label: "Tarjetas", icon: CreditCard, color: "text-chart-4" },
  { href: "/consumos", label: "Consumos", icon: ShoppingBasket, color: "text-chart-3" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt=""
                  width={32}
                  height={32}
                  className="size-6 shrink-0 rounded-md ring-1 ring-white/15"
                />
                <span className="font-semibold">CuidaTuWallet</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secciones.map(({ href, label, icon: Icon, color }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={label}
                    isActive={
                      href === "/" ? pathname === "/" : pathname.startsWith(href)
                    }
                  >
                    <Link href={href}>
                      <Icon className={color} />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-1">
            <UserMenu />
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
