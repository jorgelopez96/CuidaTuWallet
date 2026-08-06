// src/app/(app)/perfil/datos/page.tsx
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { PerfilForm } from "@/components/perfil-form";
import { Button } from "@/components/ui/button";

export default async function DatosPersonalesPage() {
  const user = await currentUser();
  const nacimiento = user?.publicMetadata?.nacimiento;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Volver al perfil" asChild>
          <Link href="/perfil">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Datos personales</h1>
      </div>

      <p className="px-2 pb-6 pt-1 text-sm text-muted-foreground">
        {user?.primaryEmailAddress?.emailAddress}
      </p>

      <PerfilForm
        nombre={user?.firstName ?? ""}
        apellido={user?.lastName ?? ""}
        nacimiento={typeof nacimiento === "string" ? nacimiento : ""}
      />
    </div>
  );
}
