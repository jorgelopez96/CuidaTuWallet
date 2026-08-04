// src/app/(app)/perfil/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { Hint } from "@/components/hint";
import { PerfilForm } from "@/components/perfil-form";

export default async function PerfilPage() {
  const user = await currentUser();
  const nacimiento = user?.publicMetadata?.nacimiento;

  return (
    <>
      <h1 className="text-2xl font-semibold">Perfil</h1>
      <Hint id="perfil">
        Editá tu nombre y tu fecha de nacimiento. El avatar sale de tus iniciales.
      </Hint>

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
