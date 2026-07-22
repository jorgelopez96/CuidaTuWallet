# CuidaTuWallet — Contexto del proyecto

> Este archivo se llama `CLAUDE.md` a propósito: Claude Code lo lee automáticamente
> al iniciar una sesión en este repositorio. Va en la **raíz del proyecto**.

---

## 1. Qué es

App web para registrar y controlar gastos mensuales. El usuario carga sus ingresos
(sueldo y otras fuentes), sus gastos por categoría y sus compras en cuotas con
tarjeta de crédito, y la app le muestra cuánto dinero le queda realmente en el mes.

Es un **proyecto de portfolio profesional**: el código tiene que ser defendible en
una entrevista técnica. Arquitectura clara, separación de responsabilidades, sin
atajos que no se puedan justificar.

- Repo: `github.com/jorgelopez96/CuidaTuWallet`
- Deploy: `cuida-tu-wallet.vercel.app` (Vercel, auto-deploy desde `main`)

---

## 2. Stack

| Capa | Actual | Objetivo tras la migración |
|---|---|---|
| Framework | React 18 + Vite | sin cambios |
| Routing | React Router DOM v6 | sin cambios |
| Estado global | Context API + useReducer | sin cambios |
| Base de datos | Firebase Firestore | **Supabase (Postgres)** |
| Autenticación | Firebase Auth | **Clerk** (Google + email) |
| Estilos | Tailwind CSS | sin cambios |
| Linter | ESLint + Prettier | sin cambios |
| Deploy | Vercel | sin cambios |

No agregar librerías fuera de este stack sin aprobación explícita.

---

## 3. Estructura de carpetas

```
src/
├── assets/            → logo.png
├── components/
│   ├── ErrorBoundary.jsx
│   ├── layout/        → AppLayout, Sidebar, MobileHeader
│   └── ui/            → Button, Input, Select, Modal, ConfirmModal, Card,
│                        Skeleton, Spinner, EmptyState, Toast, Avatar,
│                        PasswordInput, CloseButton, AnimatedBackground,
│                        AppBackground, TermsModal, ThemeToggle, PageWrapper,
│                        NavTooltip, SessionExpiredModal, OnboardingTips
├── config/            → constants.js, env.js  (firebase.js se elimina)
├── context/           → AppProviders + un contexto por dominio
├── hooks/             → un hook por dominio, prefijo use obligatorio
├── pages/             → LoginPage, RegisterPage, DashboardPage, IncomesPage,
│                        ExpensesPage, CreditCardsPage, CardDetailPage, ProfilePage
├── router/            → AppRouter, PrivateRoute
└── utils/             → formatCurrency, formatDate
```

---

## 4. Arquitectura — reglas no negociables

**Definición de capas:**

- `services/` → **solo I/O**. Nada de lógica de negocio ni estado. Naming por
  dominio: `incomesService.js`, `expensesService.js`, etc.
- `hooks/` y `context/` → **toda** la lógica de negocio vive acá.
- `components/ui/` → solo presentación. Reciben props, renderizan, emiten eventos.
- `pages/` → sin lógica compleja. Delegan siempre en hooks.
- El estado del context es la **única fuente de verdad**. No duplicar estado.

**Flujo de datos — unidireccional, ningún paso se saltea:**

```
UI dispara acción
  → hook recibe la acción
  → hook llama al service (I/O)
  → respuesta vuelve al hook
  → hook hace dispatch al context
  → context actualiza el estado global
  → UI re-renderiza
```

La UI **nunca** llama a un service directamente.

**Convenciones:**

- Primera línea de cada archivo: su path completo como comentario.
- PascalCase para componentes, camelCase para variables/funciones/hooks/services.
- Sin `console.log` ni código de debug en el output final (ESLint lo bloquea).
- Si un archivo supera las 150 líneas, avisar y proponer una división.
- Validación en todos los formularios.
- Accesibilidad básica: `aria-label`, roles semánticos.
- Mobile-first.
- Selectores / funciones derivadas centralizados en el contexto, no calculados
  en cada componente. Ejemplos existentes: `getTotalIncomes`, `getActiveIncomes`,
  `getExpensesByCategory`, `getTotalCardDebt`.

---

## 5. Modelo de datos

### Estado actual en Firestore (colecciones)

| Colección | Campos |
|---|---|
| `users` | `name`, `birthdate`, `email`, `createdAt`, `updatedAt` — doc id = uid |
| `incomes` | `userId`, `description`, `amount`, `type` (`salary`\|`other`), `month` (`YYYY-MM`), `payDay`, `expiresMonth`, `isArchived`, `createdAt` |
| `expenses` | `userId`, `description`, `amount`, `category`, `date`, `createdAt` |
| `creditCards` | `userId`, `alias`, `type`, `lastFour`, `closingDay`, `createdAt` |
| `cardExpenses` | `userId`, `cardId`, `description`, `totalAmount`, `totalInstallments`, `paidInstallments`, `currentInstallmentAmount`, `remainingInstallments`, `date`, `createdAt` |

### Esquema objetivo en Supabase (Postgres)

Convención: `snake_case` en la base, `camelCase` en el front. Los services hacen
el mapeo — **el resto de la app no se entera del cambio de nombres**.

```sql
-- Perfil. El id es el user id de Clerk (texto, no uuid).
create table profiles (
  id          text primary key,
  name        text not null,
  birthdate   date,
  email       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table incomes (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null references profiles(id) on delete cascade,
  description   text not null,
  amount        numeric(12,2) not null check (amount > 0),
  type          text not null check (type in ('salary','other')),
  month         text not null,                    -- 'YYYY-MM'
  pay_day       int check (pay_day between 1 and 31),
  expires_month text,                             -- 'YYYY-MM'
  is_archived   boolean not null default false,
  created_at    timestamptz not null default now()
);

create table expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references profiles(id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null check (amount > 0),
  category    text not null,
  date        date not null,
  created_at  timestamptz not null default now()
);

create table credit_cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references profiles(id) on delete cascade,
  alias       text not null,
  type        text not null,
  last_four   text not null check (char_length(last_four) = 4),
  closing_day int  not null check (closing_day between 1 and 31),
  created_at  timestamptz not null default now()
);

create table card_expenses (
  id                 uuid primary key default gen_random_uuid(),
  user_id            text not null references profiles(id) on delete cascade,
  card_id            uuid not null references credit_cards(id) on delete cascade,
  description        text not null,
  total_amount       numeric(12,2) not null check (total_amount > 0),
  total_installments int not null check (total_installments >= 1),
  paid_installments  int not null default 0 check (paid_installments >= 0),
  date               date not null,
  created_at         timestamptz not null default now(),

  -- Derivados: los calcula Postgres, no la app
  current_installment_amount numeric(12,2)
    generated always as (total_amount / total_installments) stored,
  remaining_installments int
    generated always as (total_installments - paid_installments) stored,

  constraint paid_lt_total check (paid_installments < total_installments)
);

create index on incomes       (user_id, is_archived);
create index on expenses      (user_id, date desc);
create index on credit_cards  (user_id);
create index on card_expenses (user_id, card_id);
```

**Dos cosas que Postgres resuelve solo y que en Firestore eran código manual:**

1. `card_id ... on delete cascade` → borrar una tarjeta borra sus gastos.
   El `writeBatch` manual del `creditCardsService` desaparece.
2. Las columnas `generated always as` → `currentInstallmentAmount` y
   `remainingInstallments` dejan de calcularse en el hook y de guardarse
   desincronizadas. Nunca más quedan mal si se edita el monto o las cuotas.

### RLS (Row Level Security)

Con Clerk, `auth.jwt() ->> 'sub'` devuelve el user id de Clerk. Patrón para
las cinco tablas (ajustar el nombre de tabla y la columna):

```sql
alter table profiles enable row level security;

create policy "own profile"
  on profiles for all
  using      (id = (select auth.jwt() ->> 'sub'))
  with check (id = (select auth.jwt() ->> 'sub'));

-- Para el resto de las tablas:
alter table incomes enable row level security;

create policy "own rows"
  on incomes for all
  using      (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));
```

El `(select ...)` alrededor de `auth.jwt()` no es cosmético: hace que Postgres
evalúe la expresión una sola vez por query en lugar de una vez por fila.

---

## 6. Variables de entorno

Se eliminan las seis `VITE_FIREBASE_*`. Quedan:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Nota: se usa la **Publishable key** nueva de Supabase (`sb_publishable_...`),
no la anon key legacy (JWT `eyJ...`). Supabase recomienda la primera para
proyectos nuevos; ambas funcionan igual con `createClient` (protegidas por
RLS, no por secreto), es solo una diferencia de nomenclatura/rotación.

`src/config/env.js` valida que estén las tres al arrancar y tira un error claro
si falta alguna (fail-fast). Mantener ese patrón.

Actualizar también: `.env.example`, y las variables en **Vercel → Settings →
Environment Variables** (borrar las de Firebase, agregar las nuevas). Después de
cambiarlas hay que hacer un **Redeploy**, no alcanza con guardarlas.

---

## 7. Autenticación con Clerk — qué cambia

**Se elimina:** `LoginPage`, `RegisterPage`, `PasswordInput`, `TermsModal`,
`AuthContext`, `authService`, y toda la lógica de validación de contraseña.
Clerk provee `<SignIn />` y `<SignUp />` con Google incluido.

**Se conserva:** el `AnimatedBackground` y el logo, como wrapper visual alrededor
de los componentes de Clerk. La estética de la pantalla de login no se pierde:
Clerk se personaliza vía `appearance` para que use la paleta violeta/indigo.

**`PrivateRoute`** pasa a usar `useAuth()` de Clerk (`isSignedIn`, `isLoaded`)
en lugar de `onAuthStateChanged`. La firma del componente y su uso en el router
no cambian — sigue siendo un guardia con `<Outlet />`.

**Sesión de 30 minutos:** hoy está implementada a mano en `AuthContext` con un
timer y `localStorage`. Clerk maneja expiración de sesión en su dashboard
(Sessions → inactivity timeout). Evaluar si conviene delegarlo o mantener el
`SessionExpiredModal` propio.

**El perfil del usuario** (`name`, `birthdate`) sigue en Supabase, tabla
`profiles`. Clerk guarda email y datos de la cuenta; la app guarda lo suyo.
Al primer login hay que crear la fila en `profiles` si no existe — el bug que
ya tuvimos con `updateDoc` sobre un documento inexistente se evita usando
`upsert` de Supabase.

**Integración Clerk ↔ Supabase:** el método cambió recientemente (antes era un
"JWT template" en Clerk; ahora es la integración nativa de *Third-Party Auth*
en Supabase). **Verificar la documentación vigente de ambos antes de implementar**
en lugar de asumir el método viejo.

---

## 8. Funcionalidades implementadas (no perder ninguna en la migración)

**Ingresos**
- Tipo `salary` (sueldo) u `other` (otra fuente)
- Los de tipo sueldo tienen día de cobro y mes de vencimiento
- Al pasar el mes de vencimiento se archivan solos (`isArchived = true`)
- Pestaña "Historial" que agrupa los archivados por mes con su total

**Gastos**
- 8 categorías con ícono y color (`EXPENSE_CATEGORIES` en `constants.js`)
- Tarjetas cuadradas seleccionables como filtro multi-categoría
- Editar y eliminar cada gasto

**Tarjetas de crédito**
- Alias, tipo, últimos 4 dígitos, día de cierre editable
- Cada tarjeta tiene su propia página (`/credit-cards/:cardId`)
- Gastos en cuotas con barra de progreso (pagadas / restantes)
- Borrar tarjeta borra sus gastos

**Dashboard**
- 4 stat cards: ingresos, gastos, tarjetas, balance
- Gráfico de torta en SVG puro (sin librerías) de gastos por categoría
- Barras de progreso por categoría

**Transversal**
- Tema oscuro (default) / claro, persistido en `localStorage`
- Fondo animado con gradiente y blobs, versión fuerte en login y sutil en la app
- Toasts, modales con `createPortal`, confirmación antes de eliminar
- Onboarding: tooltips a la derecha de cada item del menú, solo la primera vez
- Responsive: sidebar en desktop, hamburguesa + drawer en mobile
- Avatar con iniciales del nombre
- `ErrorBoundary` global, skeletons, empty states

---

## 9. Estado de la migración

- [x] Etapa 1 — Setup: proyecto Supabase, esquema SQL, RLS, app en Clerk, env vars
      (incluye las 3 env vars nuevas en Vercel — ver docs/etapa-1-setup-manual.md)
- [x] Etapa 2 — Auth: Clerk en el router, `PrivateRoute`, eliminar Login/Register propios
      (Firebase AuthContext/useAuth siguen intactos para los demás consumidores hasta Etapa 3-4)
- [x] Etapa 3 — Services: reescribir los cinco services contra Supabase
      (authService eliminado; services reciben el cliente de supabase como
      1er parámetro — la integración real con los hooks es la Etapa 4)
- [ ] Etapa 4 — Hooks y contextos: adaptar al nuevo shape de datos
- [ ] Etapa 5 — Limpieza: borrar Firebase del `package.json`, `.env`, Vercel y el código
- [ ] Etapa 6 — README técnico y checklist de buenas prácticas

Marcar cada etapa al completarla.
