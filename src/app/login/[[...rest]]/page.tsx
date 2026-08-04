// src/app/login/[[...rest]]/page.tsx
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    // El bloque va centrado con `m-auto` y no con `justify-center`: si la ventana
    // es más baja que el contenido, así se puede scrollear hasta el logo.
    <main className="relative flex flex-1 overflow-y-auto p-6">
      <div className="relative z-10 m-auto flex flex-col items-center gap-8 py-6">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt="CuidaTuWallet"
            width={96}
            height={96}
            priority
            className="size-20 rounded-2xl shadow-lg shadow-black/40"
          />
          <h1 className="text-2xl font-semibold text-white">CuidaTuWallet</h1>
          <p className="text-sm text-white/60">Tus gastos e ingresos, mes a mes.</p>
        </div>

        <SignIn />
      </div>
    </main>
  );
}
