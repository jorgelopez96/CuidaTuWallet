// src/components/subir-resumen.tsx
"use client";

import { useState, useTransition } from "react";
import { FileText } from "lucide-react";
import { importarGastos } from "@/app/(app)/_actions/gastos";
import { analizarResumen, type ResumenLeido } from "@/lib/resumen-parser";
import { textoDePdf } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ResumenPreview } from "@/components/resumen-preview";

const hoy = () => new Date().toISOString().slice(0, 10);

export function SubirResumen({
  tarjetaId,
  ultimos4,
}: {
  tarjetaId: string;
  ultimos4: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [leido, setLeido] = useState<ResumenLeido | null>(null);
  const [vencimiento, setVencimiento] = useState(hoy());
  const [error, setError] = useState<string>();
  const [pendiente, iniciar] = useTransition();

  function reiniciar(a: boolean) {
    setAbierto(a);
    if (!a) {
      setTexto("");
      setLeido(null);
      setError(undefined);
    }
  }

  function analizar(contenido: string) {
    const resultado = analizarResumen(contenido);
    if (!resultado.gastos.length)
      return setError("No reconocí ningún consumo en ese resumen.");
    setError(undefined);
    setVencimiento(resultado.vencimiento ?? hoy());
    setLeido(resultado);
  }

  return (
    <Dialog open={abierto} onOpenChange={reiniciar}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText />
          Cargar resumen
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cargar resumen</DialogTitle>
          <DialogDescription>
            Subí el PDF o pegá el texto. El archivo <strong>no se guarda ni se sube</strong>:
            se lee acá en tu navegador para sacar los consumos y se descarta.
          </DialogDescription>
        </DialogHeader>

        {!leido ? (
          <>
            <Input
              type="file"
              accept="application/pdf,text/plain,.csv"
              disabled={pendiente}
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (!archivo) return;
                iniciar(async () => {
                  try {
                    const contenido = archivo.type.includes("pdf")
                      ? await textoDePdf(archivo)
                      : await archivo.text();
                    analizar(contenido);
                  } catch {
                    setError("No pude leer ese archivo. Probá pegando el texto.");
                  }
                });
              }}
            />

            <p className="text-center text-xs text-muted-foreground">o pegá el texto</p>

            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={8}
              placeholder="30-07-25 * COMERCIO 12/12 000575 48.563,33"
              className="w-full rounded-md border bg-transparent p-3 font-mono text-xs"
            />

            <DialogFooter>
              <Button
                disabled={!texto.trim() || pendiente}
                onClick={() => analizar(texto)}
              >
                {pendiente ? "Leyendo…" : "Analizar"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <ResumenPreview
              leido={leido}
              ultimos4Tarjeta={ultimos4}
              vencimiento={vencimiento}
              onVencimiento={setVencimiento}
            />

            <DialogFooter>
              <Button variant="outline" onClick={() => setLeido(null)}>
                Volver
              </Button>
              <Button
                disabled={pendiente}
                onClick={() =>
                  iniciar(async () => {
                    const r = await importarGastos(
                      tarjetaId,
                      leido.gastos,
                      vencimiento,
                    );
                    if (r.error) return setError(r.error);
                    reiniciar(false);
                  })
                }
              >
                {pendiente ? "Guardando…" : `Guardar ${leido.gastos.length}`}
              </Button>
            </DialogFooter>
          </>
        )}

        {error && <p className="text-sm text-gasto">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
