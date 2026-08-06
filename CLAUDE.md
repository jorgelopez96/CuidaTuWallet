@AGENTS.md

# Proyecto: CuidaTuWallet

## Qué es

App web de control de gastos e ingresos mensuales. Permite registrar gastos en
efectivo, débito, transferencia y tarjeta de crédito, cargar tarjetas y
resúmenes, y cargar ingresos (sueldo, ventas, etc.) para llevar un seguimiento
de cuánto dinero queda disponible en el mes.

## Stack técnico

- Next.js + TypeScript
- Tailwind + shadcn/ui
- Supabase (base de datos, configurada para no darse de baja nunca)
- Clerk (autenticación/login)
- App web por ahora; pensada para escalar a mobile más adelante (no ahora)

## Estructura de navegación

En escritorio, sidebar lateral izquierdo. En mobile, barra inferior flotante
estilo billetera virtual: las cuatro secciones con el alta de gasto destacada
en un botón central elevado, y el sidebar oculto.

1. **Dashboard**: lo que entró, lo que salió y el disponible del mes. Abajo,
   "Movimientos mensuales": ingresos y gastos del mes en una sola lista de solo
   lectura, ordenada por fecha. Más el gráfico de cuotas comprometidas y la
   torta de gastos por categoría.
2. **Ingresos**: sueldo, ventas, alquileres que se cobran. Un ingreso puede ser
   puntual —cuenta solo en su mes— o **recurrente**, y entonces cuenta todos los
   meses entre su alta y su baja sin generar una fila por mes. Pestañas Activos
   e Historial; los recurrentes se cierran con "Dar de baja".
3. **Tarjetas**: cards visuales tipo tarjeta física (Visa, Mastercard, Amex,
   Naranja X y otras tarjetas argentinas), mostrando banco y últimos 4 dígitos.
   En mobile van en un carrusel con scroll-snap; en escritorio, en grilla.
   Al tocar una tarjeta se accede a su detalle, donde se pueden cargar gastos
   manualmente o subiendo el resumen. Necesito una regla que lea el resumen y
   cargue los gastos automáticamente. Los resúmenes NO se guardan en ningún
   lado, solo se leen para extraer los gastos (esto debe estar aclarado en la UI).
   Los gastos importados entran todos como propios y sin pagar; cada uno se
   pasa a "de un tercero" (préstamo de tarjeta) con un click en su chip, y el
   detalle muestra el total de cada uno por separado. Lo de terceros queda
   registrado solo acá: no es plata propia, así que no aparece en el dashboard
   ni descuenta del disponible. Los gastos se agrupan por
   vencimiento —eso es un resumen— y cada resumen se marca pagado entero:
   mientras esté impago se ve en el dashboard pero no descuenta del disponible.
   Opción de borrar tarjetas con doble confirmación.
4. **Consumos**: carga de gastos sueltos — carnicería, verdulería,
   suscripciones (Netflix, Spotify, etc.), transporte (SUBE, Uber) — que también
   descuentan del dinero disponible. Ocho categorías: Suscripciones,
   Supermercado, Transporte, Servicios, Entretenimiento, Educación, Salud y
   Otros, esta última siempre al final. En mobile los chips van en un carrusel
   sin principio ni fin; en escritorio, en grilla de cuatro. Cada gasto muestra
   su medio de pago (efectivo, débito, transferencia).
5. **Perfil**: se entra desde el saludo con la foto en el encabezado mobile, o
   desde el menú de usuario del sidebar. Tiene datos personales, claves y
   seguridad (panel de Clerk), apariencia, borrar datos de la app —con doble
   confirmación— y cerrar sesión.

## Decisiones de diseño

- Paleta: índigo + esmeralda — primario #4F46E5, dark accent #312E81,
  positivo/ingreso #10B981, negativo/gasto #EF4444. Nueve colores de gráfico
  (`--chart-1` a `--chart-9`); el 1 queda reservado para la marca y no se
  asigna a ninguna categoría, porque en la torta se confunde con el fondo
- Tema oscuro por defecto con toggle a claro. Lo que dependa del tema se
  resuelve con clases `dark:` y no leyendo `resolvedTheme`: ese valor no existe
  en el servidor y rompe la hidratación
- Sidebar lateral en desktop, barra inferior en mobile
- Fondo animado con gradiente sutil en login
- Onboarding con tooltips la primera vez que se usa cada sección del menú
- Avatar: si entró con Google se usa esa foto; si no, las iniciales del nombre
- Ingresos tipo sueldo se archivan al vencer el mes, quedan en historial mes a mes
- Gráfico de torta en el dashboard para distribución de gastos
- Cada tarjeta de crédito tiene su propia página con sus gastos
- Los montos se tipean con separador de miles (1.500.000), formato es-AR
- La grilla de Tarjetas muestra el total consolidado de todas: Total, Propios y
  De terceros
- El perfil usa un resplandor difuminado detrás de la foto, con los mismos
  índigo y esmeralda del fondo animado, en vez de un anillo
- Pendiente (fase visual): cada tarjeta con el logo real de su marca (Visa,
  Mastercard, Amex, Naranja X) y la tipografía del banco

## Distribución

Se reparte como PWA y como APK. `src/app/manifest.ts` es el manifest, los
íconos los genera `scripts/generar-iconos.mjs` a partir de `public/logo.png`, y
`public/cuidatuwallet.apk` es un TWA que envuelve el sitio en vivo: no hay
código nativo ni build aparte, y un deploy a Vercel alcanza para actualizar la
app instalada. `public/.well-known/assetlinks.json` lleva la huella de la clave
que firma ese APK; si se refirma con otra clave hay que actualizarlo o la app
muestra la barra de direcciones de Chrome.

En mobile se cuidan dos cosas que rompen fácil: el ancho de las tarjetas del
carrusel —abajo de 235px el número enmascarado no entra— y que el contenido
deje lugar al nav inferior flotante.

## Reglas de trabajo

- Avanzar por etapas esperando mi confirmación antes de seguir, no generar
  todo junto
- Nunca tomar decisiones de diseño o arquitectura sin consultarme primero
- Primera línea de cada archivo: su path completo como comentario
- Sin console.log ni código de debug en el output final
- Avisar si un archivo supera las 150 líneas
- Separación de responsabilidades clara (I/O, lógica de negocio, presentación)
  adaptada a las convenciones de Next.js
