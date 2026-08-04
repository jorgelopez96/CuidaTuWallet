// src/app/(app)/layout.tsx
import { auth } from "@clerk/nextjs/server";
import { AppSidebar } from "@/components/app-sidebar";
import { GuiaRapida } from "@/components/guia-rapida";
import { TransicionPagina } from "@/components/transicion-pagina";
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
          <SidebarTrigger />
        </header>
        <div className="relative z-10 flex flex-1 flex-col p-6">
          <TransicionPagina>{children}</TransicionPagina>
        </div>
      </SidebarInset>
      <GuiaRapida />
    </SidebarProvider>
  );
}
