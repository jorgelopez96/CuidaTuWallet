# CuidaTuWallet

App web para controlar gastos e ingresos mes a mes. Registra ingresos (sueldo,
ventas), gastos sueltos (supermercado, transporte, suscripciones) y gastos de
tarjeta de crédito —incluidas las cuotas— y calcula cuánta plata queda
disponible en el mes.

Lee resúmenes de tarjeta en PDF y carga los consumos automáticamente.

## Stack

| Capa | Herramienta |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 + shadcn/ui |
| Animaciones | Motion (Framer Motion) |
| Autenticación | Clerk |
| Base de datos | Supabase (Postgres + RLS) |
| Gráficos | Recharts |
| Lectura de PDF | unpdf, en el navegador |
| Deploy | Vercel |

## Arranque local

```bash
git clone <url-del-repo>
cd cuidatuwallet
npm install
cp .env.local.example .env.local   # completar con las claves
npm run dev
```

La app queda en <http://localhost:3000>.

### Variables de entorno

| Variable | Dónde sacarla |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk → API keys |
| `CLERK_SECRET_KEY` | Clerk → API keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project settings |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → API keys |
| `CRON_SECRET` | La genera Vercel al crear el cron; en local puede ir vacía |

## Comandos

```bash
npm run dev     # desarrollo
npm run build   # build de producción
npm run start   # servir el build
npm run lint    # eslint
npm test        # tests de la lógica de negocio
```

## Base de datos

Las migraciones están en `supabase/migrations/`, en orden. Se aplican desde el
SQL Editor de Supabase.

Tres tablas —`ingresos`, `tarjetas`, `gastos`— todas con `user_id` y **Row Level
Security**: cada fila solo es visible para su dueño, comparando
`auth.jwt() ->> 'sub'` contra el `user_id`. El `user_id` no lo manda el cliente:
lo pone Postgres por defecto a partir del token.

### Cómo se conectan Clerk y Supabase

Clerk está dado de alta como *third-party auth provider* en Supabase. El token
de sesión de Clerk viaja en cada consulta y Postgres lo valida contra el JWKS de
Clerk, así que la autorización vive en la base y no en el frontend.

### Las dos fechas de un gasto

- `fecha` — el mes al que **imputa** el gasto. En un resumen de tarjeta es el
  vencimiento: la cuota se paga cuando vence el resumen.
- `fecha_compra` — cuándo se hizo la compra original. Solo para consumos
  importados de un resumen.

La distinción importa: una cuota 12/12 de una compra de hace un año se paga
**este** mes, y es este mes el que tiene que descontar del disponible.

## Lectura de resúmenes

`src/lib/resumen-parser.ts` extrae los consumos del texto de un resumen.
Reconoce el formato de Galicia (VISA y Amex comparten layout) y tiene un formato
genérico de respaldo para texto pegado de otros bancos.

El PDF se procesa **en el navegador**: el archivo nunca se sube a ningún
servidor ni se guarda. Lo detectado se muestra para revisar antes de guardar;
nunca se inserta a ciegas.

Para probar el parser contra un PDF real, sin tocar la base:

```bash
npx tsx scripts/probar-resumen.mjs "ruta/al/resumen.pdf"
```

## Estructura

```
src/
  app/
    (app)/            # zona autenticada: sidebar + secciones
      _actions/       # server actions por dominio
      tarjetas/[id]/  # detalle de cada tarjeta
    api/ping/         # cron diario que evita que Supabase pause el proyecto
    login/
  components/         # UI propia
    ui/               # componentes de shadcn
  hooks/
  lib/                # lógica de negocio pura, con sus tests al lado
supabase/migrations/
scripts/              # utilidades de desarrollo
public/marcas/        # logos de las redes de tarjeta
```

La lógica de negocio vive en `src/lib/` sin dependencias de React ni de la base,
y cada archivo tiene su test al lado (`*.test.ts`). Las páginas hacen I/O y
presentación; las server actions validan antes de escribir, y la base vuelve a
validar con constraints y RLS.

## Deploy

Deploy en Vercel. El cron de `vercel.json` pega en `/api/ping` una vez por día
para que Supabase no pause el proyecto por inactividad; el endpoint exige el
header `Authorization: Bearer $CRON_SECRET`.

## Marcas

Los logos de `public/marcas/` son marcas registradas de sus titulares y se usan
únicamente para identificar la tarjeta de cada usuario.
