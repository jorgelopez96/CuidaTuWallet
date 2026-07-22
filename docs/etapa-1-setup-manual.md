# Etapa 1 — Setup manual (Supabase + Clerk)

Pasos que hacés vos a mano en los dashboards. El código de la Etapa 1 ya asume
que esto está hecho cuando lo pruebes localmente.

## 1. Crear el proyecto en Supabase

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Elegí región y una contraseña de base (no la vas a necesitar para la app,
   solo para acceso directo a Postgres si hace falta).
3. Una vez creado: **Project Settings → API** → copiá:
   - `Project URL` → va en `VITE_SUPABASE_URL`.
   - `anon public` key → va en `VITE_SUPABASE_ANON_KEY`.

## 2. Correr el esquema SQL

1. En el dashboard de Supabase: **SQL Editor → New query**.
2. Pegá el contenido completo de `supabase/schema.sql` (de este repo) y
   ejecutalo. Crea las 5 tablas, los índices y las políticas RLS.
3. Verificá en **Table Editor** que aparezcan `profiles`, `incomes`,
   `expenses`, `credit_cards`, `card_expenses`.

## 3. Crear la app en Clerk

1. [dashboard.clerk.com](https://dashboard.clerk.com) → **Create application**.
2. Nombre: `CuidaTuWallet` (o el que prefieras).
3. En **Sign-in options**, habilitá **Email** y **Google**.
4. **API Keys** → copiá la `Publishable key` → va en
   `VITE_CLERK_PUBLISHABLE_KEY`.

## 4. Conectar Clerk como Third-Party Auth provider en Supabase

El método vigente (desde abril 2025) es la integración nativa — **no** un JWT
template, ese approach está deprecado.

1. En Clerk: buscá la sección **Supabase** dentro de integraciones
   (Configure → Integrations → Supabase, o el link directo que te da Clerk
   "Connect with Supabase"). Activala. Esto te va a mostrar tu **Clerk
   domain** (algo como `xxxxx.clerk.accounts.dev`).
2. En Supabase: **Authentication → Sign In / Providers → Third-Party Auth**
   → **Add provider** → **Clerk** → pegá el domain del paso anterior.
3. Guardá.

Con esto, cuando el front mande el token de sesión de Clerk, Supabase lo va a
validar contra ese domain y `auth.jwt() ->> 'sub'` en las políticas RLS va a
devolver el user id de Clerk — sin compartir ningún secreto entre ambos.

## 5. Variables de entorno locales

En la raíz del proyecto:

```bash
cp .env.example .env
```

Completá las 6 variables de Firebase (siguen en uso hasta la Etapa 5) más las
3 nuevas:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 6. Variables de entorno en Vercel

Todavía no borres las de Firebase (siguen en uso). Agregá las 3 nuevas en
**Project Settings → Environment Variables** para Production, Preview y
Development. No hace falta redeploy todavía — recién importa cuando el código
que las usa esté mergeado a `main`.

---

Cuando tengas los pasos 1 a 4 hechos y las variables cargadas en tu `.env`
local, avisame para seguir con la Etapa 2 (autenticación con Clerk).
