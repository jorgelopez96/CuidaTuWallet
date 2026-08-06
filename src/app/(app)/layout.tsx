// src/app/(app)/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { Download } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { GuiaRapida } from "@/components/guia-rapida";
import { NavMobile } from "@/components/nav-mobile";
import { SaludoPerfil } from "@/components/saludo-perfil";
import { TransicionPagina } from "@/components/transicion-pagina";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

// Todo acá es por usuario; nunca es estático. Evita que el build intente prerenderizar.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await auth.protect();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative bg-transparent">
        <header className="relative z-10 flex h-14 items-center gap-2 border-b px-4">
          {/* En mobile no hay sidebar que abrir: manda el nav de abajo, y arriba
              va el saludo con la foto, que lleva al perfil. */}
          <SidebarTrigger className="hidden md:flex" />
          <div className="md:hidden">
            <SaludoPerfil />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* El APK se reparte desde escritorio: quien ya está adentro de la
                app no necesita descargarla. */}
            <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
              <a href="/cuidatuwallet.apk" download>
                <Download />
                Descargar APK
              </a>
            </Button>
            <GuiaRapida />
          </div>
        </header>

        {/* pb-28 deja lugar al nav flotante. sm:px-6/pt-6 en vez de sm:p-6 para
            no pisar ese pb en las pantallas donde el nav todavía se muestra. */}
        <div className="relative z-10 flex flex-1 flex-col p-4 pb-28 sm:px-6 sm:pt-6 md:pb-6">
          <TransicionPagina>{children}</TransicionPagina>
        </div>
      </SidebarInset>

      <NavMobile />
    </SidebarProvider>
  );
}
