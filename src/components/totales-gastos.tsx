// src/components/totales-gastos.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MontoAnimado } from "@/components/monto-animado";

/** Mismo trío de tarjetas en la grilla de tarjetas y en el detalle de cada una. */
export function TotalesGastos({
  propios,
  ajenos,
}: {
  propios: number;
  ajenos: number;
}) {
  const items = [
    { titulo: "Total", valor: propios + ajenos, color: "" },
    { titulo: "Propios", valor: propios, color: "" },
    { titulo: "De terceros", valor: ajenos, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ titulo, valor, color }) => (
        <Card key={titulo} className="elevable">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {titulo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MontoAnimado
              valor={valor}
              className={`block text-2xl font-semibold ${color}`}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
