// src/app/(app)/perfil/page.tsx
import { PerfilMenu } from "@/components/perfil-menu";

/** El menú lee todo de Clerk en el cliente, así que acá no hay nada que traer. */
export default function PerfilPage() {
  return <PerfilMenu />;
}
