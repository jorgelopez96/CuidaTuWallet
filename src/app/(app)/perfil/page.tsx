// src/app/(app)/perfil/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { PerfilForm } from "@/components/perfil-form";

export default async function PerfilPage() {
  const user = await currentUser();
  const nacimiento = user?.publicMetadata?.nacimiento;

  return (
    <>
      <h1 className="text-2xl font-semibold">Perfil</h1>

      <p className="text-sm text-muted-foreground">
        {user?.primaryEmailAddress?.emailAddress}
      </p>

      <PerfilForm
        nombre={user?.firstName ?? ""}
        apellido={user?.lastName ?? ""}
        nacimiento={typeof nacimiento === "string" ? nacimiento : ""}
      />
    </>
  );
}
