// src/components/fondo-animado.tsx

/**
 * Fondo de toda la app: un gradiente base que se desplaza lento y cinco manchas
 * de color difuminadas. Va `fixed` detrás de todo —sidebar incluido— y el resto
 * de las superficies son translúcidas, así que esto se ve a través de la app.
 *
 * Todo en CSS: no baja JS y las manchas las mueve la GPU. En mobile el
 * gradiente queda quieto y las manchas se desenfocan menos, que es de donde
 * salía casi todo el costo en un teléfono de gama media.
 */

type Mancha = {
  color: string;
  tamano: string;
  posicion: string;
  dx: string;
  dy: string;
  esc: number;
  duracion: string;
};

const MANCHAS: Mancha[] = [
  {
    color: "bg-indigo-600/22",
    tamano: "size-[700px]",
    posicion: "top-0 right-0",
    dx: "40px",
    dy: "-30px",
    esc: 1.06,
    duracion: "16s",
  },
  {
    color: "bg-emerald-600/16",
    tamano: "size-[600px]",
    posicion: "bottom-0 left-0",
    dx: "-35px",
    dy: "30px",
    esc: 1.07,
    duracion: "22s",
  },
  {
    color: "bg-indigo-500/14",
    tamano: "size-[500px]",
    posicion: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    dx: "15px",
    dy: "-35px",
    esc: 1.05,
    duracion: "12s",
  },
  {
    color: "bg-emerald-500/12",
    tamano: "size-[350px]",
    posicion: "top-1/4 left-1/4",
    dx: "-30px",
    dy: "25px",
    esc: 1.06,
    duracion: "19s",
  },
  {
    color: "bg-indigo-400/12",
    tamano: "size-[300px]",
    posicion: "bottom-1/4 right-1/4",
    dx: "30px",
    dy: "-20px",
    esc: 1.05,
    duracion: "25s",
  },
];

export function FondoAnimado() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="fondo-gradiente absolute inset-0 bg-[linear-gradient(135deg,#f4f3ff_0%,#e9e6ff_50%,#f4f3ff_100%)] dark:bg-[linear-gradient(135deg,#0c0a20_0%,#130e2e_50%,#0c0a20_100%)]" />

      <div className="absolute inset-0 overflow-hidden">
        {MANCHAS.map(({ color, tamano, posicion, dx, dy, esc, duracion }, i) => (
          <div
            key={i}
            className={`mancha absolute rounded-full blur-2xl md:blur-3xl ${color} ${tamano} ${posicion}`}
            style={
              {
                "--dx": dx,
                "--dy": dy,
                "--esc": esc,
                "--dur": duracion,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
