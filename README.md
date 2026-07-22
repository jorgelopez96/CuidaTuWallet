# CuidaTuWallet

App web para registrar ingresos, gastos y compras en cuotas con tarjeta de
crédito, y ver cuánto dinero queda realmente disponible en el mes.

Live: [cuida-tu-wallet.vercel.app](https://cuida-tu-wallet.vercel.app)

## Stack

- **React 18** + **Vite**
- **React Router DOM v6**
- **Context API + useReducer** (estado global, sin librerías externas)
- **Supabase** (Postgres + Row Level Security) — base de datos
- **Clerk** (Google + email) — autenticación
- **Tailwind CSS**
- **ESLint + Prettier**
- Deploy: **Vercel**, auto-deploy desde `main`

## Arquitectura

Capas con responsabilidad única, flujo de datos unidireccional:

```
UI dispara acción
  → hook recibe la acción
  → hook llama al service (I/O contra Supabase)
  → respuesta vuelve al hook
  → hook hace dispatch al context
  → context actualiza el estado global
  → UI re-renderiza
```

- `services/` — solo I/O contra Supabase. Sin lógica de negocio ni estado.
  Reciben el cliente de Supabase como primer parámetro (no son un singleton:
  el cliente necesita el token de sesión de Clerk, que solo existe dentro de
  un hook de React). Hacen el mapeo `snake_case` (DB) ↔ `camelCase` (front).
- `hooks/` + `context/` — toda la lógica de negocio. El estado del context es
  la única fuente de verdad; los componentes nunca llaman a un service directo.
- `components/ui/` — solo presentación, reciben props y emiten eventos.
- `pages/` — sin lógica compleja, delegan siempre en hooks.

```
src/
├── assets/            → logo.png
├── components/
│   ├── ErrorBoundary.jsx
│   ├── layout/        → AppLayout, Sidebar, MobileHeader
│   └── ui/            → componentes presentacionales reutilizables
├── config/            → constants.js, env.js, supabase.js, clerkAppearance.js
├── context/           → AppProviders + un contexto por dominio
├── hooks/             → un hook por dominio (useIncomes, useExpenses,
│                        useCreditCards, useUser, useSupabase)
├── pages/              → Dashboard, Incomes, Expenses, CreditCards,
│                        CardDetail, Profile, Login, Register
├── router/             → AppRouter, PrivateRoute
├── services/            → I/O puro contra Supabase, uno por dominio
└── utils/               → formatCurrency, formatDate
```

## Modelo de datos

Postgres en Supabase, 5 tablas: `profiles`, `incomes`, `expenses`,
`credit_cards`, `card_expenses`. Esquema completo con constraints, índices y
políticas RLS en [`supabase/schema.sql`](./supabase/schema.sql).

Puntos que resuelve Postgres y que antes eran código manual:

- **`on delete cascade`** en `card_expenses.card_id` → borrar una tarjeta
  borra sus gastos en cuotas automáticamente, sin `writeBatch`.
- **Columnas `generated always as`** → `current_installment_amount` y
  `remaining_installments` los calcula la base, nunca el front. No hay forma
  de que queden desincronizados si se edita el monto o las cuotas.
- **Row Level Security** — cada tabla tiene una policy `using/with check
  (user_id = auth.jwt() ->> 'sub')`. Nadie puede leer ni escribir filas que
  no sean suyas, sin necesidad de filtrar por `userId` a mano en cada query
  (igual se filtra, por índice, pero la seguridad no depende de ese filtro).

## Autenticación

Clerk maneja login/registro (`<SignIn/>`, `<SignUp/>`, Google OAuth) y emite
un JWT de sesión. Supabase valida ese JWT directo vía **Third-Party Auth**
(integración nativa, sin compartir secretos entre ambos servicios): el
dashboard de Supabase tiene registrado el dominio de Clerk, y cada policy RLS
lee el `sub` del token con `auth.jwt() ->> 'sub'` para saber quién sos.

El cliente de Supabase (`src/config/supabase.js` + `src/hooks/useSupabase.js`)
se construye pasándole una función que llama a `session.getToken()` de Clerk
en cada request — no hay credenciales de Supabase involucradas en el login.

El perfil (`name`, `birthdate`) vive en la tabla `profiles` de Supabase, no en
Clerk. En el primer login, si no existe la fila, se crea con `upsert`
sembrada con el nombre/email que ya tiene Clerk — necesario además porque
`incomes`/`expenses`/`credit_cards` tienen FK a `profiles`.

## Setup local

```bash
# 1. Clonar e instalar
git clone https://github.com/jorgelopez96/CuidaTuWallet.git
cd CuidaTuWallet
npm install

# 2. Crear un proyecto en supabase.com/dashboard y correr supabase/schema.sql
#    en el SQL Editor (crea tablas, índices y políticas RLS).

# 3. Crear una app en dashboard.clerk.com, habilitar Email + Google,
#    y conectarla como Third-Party Auth provider en Supabase
#    (Authentication → Sign In / Providers → Third-Party Auth → Clerk).

# 4. Variables de entorno
cp .env.example .env
# completar con las claves de Clerk y Supabase (ver abajo)

# 5. Levantar en desarrollo
npm run dev
```

## Variables de entorno

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Las tres son obligatorias — `src/config/env.js` valida al arrancar y tira un
error claro si falta alguna (fail-fast), en vez de fallar más tarde con un
error críptico de red.

## Scripts

```bash
npm run dev       # Desarrollo
npm run build     # Build de producción
npm run lint      # ESLint
npm run format    # Prettier
```

## Deploy

Push a `main` → Vercel redeploya automático. Las mismas 3 variables de
entorno tienen que estar cargadas en **Vercel → Settings → Environment
Variables** para Production, Preview y Development.

## Decisiones de arquitectura y trade-offs

Este proyecto arrancó con Firebase (Auth + Firestore) y se migró a
Supabase + Clerk. Algunas decisiones tomadas en el camino:

- **Supabase en vez de seguir con Firestore**: Postgres real permite
  constraints, FKs con `on delete cascade`, columnas generadas y RLS
  declarativo — todas cosas que en Firestore eran código manual (`writeBatch`,
  recalcular `currentInstallmentAmount` en el hook, filtrar `userId` a mano).
- **Clerk en vez de mantener auth propia**: componentes prearmados
  (`<SignIn/>`, `<SignUp/>`), Google OAuth sin configurar nada de OAuth a
  mano, y manejo de sesión/tokens ya resuelto.
- **Integración nativa Clerk↔Supabase (Third-Party Auth) en vez de JWT
  template**: el método viejo (compartir un secreto de Clerk como JWT
  template en Supabase) está deprecado desde abril 2025. El método nuevo no
  comparte ningún secreto: Supabase valida el JWT de Clerk contra su dominio
  público.
- **Publishable key en vez de anon key legacy**: Supabase migró a un sistema
  nuevo de API keys (`sb_publishable_...`) para proyectos nuevos. Funciona
  igual que la anon key vieja (protegida por RLS, no por secreto), es la
  opción que recomienda la plataforma hoy.
- **Migración en etapas** (ver historial de commits): setup → auth → services
  → hooks/contexts → limpieza de Firebase → docs. Cada etapa se commiteó y
  verificó por separado — durante las etapas 2 y 3 el dashboard no cargaba
  datos reales a propósito (el auth ya era Clerk pero los hooks todavía
  esperaban un usuario de Firebase), un estado intermedio esperado en una
  migración de auth + DB simultánea sin tiempo de inactividad forzado.
- **Clerk en modo Development, no Production**: crear una instancia
  Production de Clerk requiere un dominio propio con DNS propio (para el
  CNAME de su Frontend API). El dominio de este proyecto es
  `cuida-tu-wallet.vercel.app`, que es de Vercel — Clerk lo rechaza
  explícitamente para Production. Queda como mejora futura si se compra un
  dominio propio.

## Buenas prácticas aplicadas

- Separación estricta de capas (services / hooks+context / components / pages)
  con flujo de datos unidireccional, sin atajos.
- Mapeo explícito `snake_case` ↔ `camelCase` en la frontera de cada service —
  el resto de la app no sabe cómo se llaman las columnas en la base.
- Row Level Security en las 5 tablas, no solo filtrado del lado del cliente.
- Fail-fast en variables de entorno: la app no arranca a medias con config
  incompleta.
- Sin `console.log` ni código de debug (bloqueado por ESLint).
- Validación en todos los formularios, accesibilidad básica (`aria-label`,
  roles semánticos), diseño mobile-first.
- Selectores derivados centralizados en el context (`getTotalIncomes`,
  `getExpensesByCategory`, etc.), no recalculados en cada componente.
- Un commit por etapa de migración, con verificación end-to-end en el
  navegador antes de dar cada una por cerrada (no solo build/lint limpios).

## Mejoras futuras

- Clerk Production instance (requiere dominio propio) + credenciales OAuth de
  Google propias en vez de las compartidas de desarrollo.
- Code splitting del bundle (hoy un solo chunk de ~550 KB).
- Resolver los warnings de `react-hooks/exhaustive-deps` pendientes en los
  hooks de fetch (`fetchIncomes`, `fetchExpenses`, etc. no están en los
  arrays de dependencias de los `useEffect` que los llaman).
