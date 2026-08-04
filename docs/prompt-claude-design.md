# Cómo pasarle CuidaTuWallet a Claude Design

Claude Design no funciona pegando un texto largo. Tiene tres piezas separadas y
conviene usar las tres.

---

## Paso 1 — Adjuntar el contexto

En el panel izquierdo, **"Start with context"**, hay cuatro opciones. Usá dos:

**Codebase** — abre un diálogo que dice *"Drop your codebase here. For large
codebases, drop the frontend or design system folder"*. **Pide una carpeta
local, no una URL de GitHub.** Arrastrá:

```
D:\PROYECTOS\CuidaTuWallet 2.0\src
```

Con eso lee los componentes reales, `globals.css` con todos los tokens y la
estructura entera. Es la fuente de contexto más completa.

**Screenshot** — subí las tres capturas de `docs/capturas/`:

```
01-inicio.jpg
02-consumos.jpg
03-tarjetas.jpg
```

Un brief describe; una captura muestra el ritmo y la densidad reales, que es
justo lo que está flojo.

---

## Paso 2 — Elegir template y design system

- **Template**: *UI mockups* para pantallas. *Color + type pairing* si querés
  atacar primero la paleta y la tipografía.
- **Design system**: por defecto viene *Argus Design System*, que **no es el
  nuestro**. Creá uno nuevo con "Create design system" y llamalo
  **CuidaTuWallet**, o dejá el que venga y aclarale en el prompt que respete los
  tokens del código adjunto.

Un design system en esta herramienta se organiza en Foundations (Color, Icons,
Imagery, Spacing & elevation, Typography), Components (Buttons & tags, Cards,
Dialog, Forms, Navigation, Table) y Theme (Parameters). Si armás el de
CuidaTuWallet, los valores están en `src/app/globals.css` y en
`docs/brief-diseno.md`.

---

## Paso 3 — El prompt

Pegá esto en el campo *"Describe what you want to create..."*:

---

Estoy rediseñando **CuidaTuWallet**, una app web de finanzas personales en
español rioplatense, para un usuario argentino. Adjunté el código y capturas de
las pantallas reales.

**Qué hace**: registra ingresos, gastos sueltos y gastos de tarjeta de crédito
—incluidas las cuotas, que en Argentina son la norma— y calcula cuánta plata
queda disponible en el mes. Ese número, el **disponible**, es el corazón del
producto: todo lo demás existe para explicarlo o alimentarlo.

**Estado**: terminado y en producción, con datos reales. No busco un rediseño de
cero, busco subir el nivel visual de lo que ya existe.

**Stack**: Next.js 16, Tailwind CSS v4, shadcn/ui, Motion, Recharts.

**Sistema visual actual**:
- Tipografía Nunito Sans. La referencia de tono es Mercado Pago.
- Marca índigo (`#4f46e5` claro / `#6366f1` oscuro) + esmeralda. Verde para
  plata que entra, rojo para la que sale.
- Tema oscuro por defecto con toggle a claro. Los dos tienen que funcionar.
- Las superficies llevan 2-4% de croma índigo, no son grises neutros.
- Toda la app flota sobre un fondo animado fijo, y las cards son translúcidas
  con `backdrop-blur`. Ese efecto de vidrio es la identidad del producto.

**Límites**:
- La paleta índigo + esmeralda es la marca: ajustá tonos y aplicación, no la
  familia.
- El vidrio sobre fondo animado se puede calibrar, no sacar.
- Verde = entra, rojo = sale. Es convención del rubro.
- Todo el texto va en español rioplatense, con voseo. Montos en formato es-AR:
  `$ 1.500.000`.

**Dónde flojea hoy**, en orden de importancia:

1. **Las tablas son las de shadcn sin trabajar.** Filas parejas, sin jerarquía
   entre descripción, fecha y monto. Es la superficie más usada de la app y la
   menos diseñada.
2. **No hay estados de carga.** Se pasa de nada al contenido, sin skeletons.
3. **Densidad pareja en todas las pantallas.** Todo pesa lo mismo, nada guía el
   ojo. En Inicio, el disponible debería dominar y no lo hace.
4. **Los diálogos son campos apilados.** Cumplen y nada más.
5. **La dona es el único gráfico.** No hay evolución mes a mes ni comparación
   contra el mes anterior.
6. **Mobile está resuelto, no diseñado.** Las grillas se apilan y listo.

**Qué necesito**, priorizado:

1. Jerarquía y ritmo en Inicio y en las tablas.
2. Una escala tipográfica y de espaciado explícita: tamaños, pesos, cuándo usar
   cada uno.
3. Un tratamiento propio para tablas y listas.
4. Estados de carga y vacío que acompañen.
5. Mobile pensado, no solo apilado.

Entregame los valores como tokens y clases de Tailwind cuando se pueda: el
sistema ya está montado sobre variables CSS y así lo aplico directo.

Arranquemos por el punto 1.

---

## Nota sobre las capturas

Los datos son escasos a propósito —un ingreso, un gasto, una tarjeta— porque es
una app de uso personal recién puesta en marcha. Si necesitás ver cómo se
comporta con volumen, pedime capturas con más filas y las genero.
