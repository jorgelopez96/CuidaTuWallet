# Etapa 1 — Setup manual (Supabase + Clerk)

Estado: **hecho** (automatizado vía navegador con supervisión de Jorge, 2026-07-22).

## 1. Proyecto en Supabase

- Proyecto **CuidaTuWallet** creado en la organización `delbajon`, región
  `sa-east-1` (São Paulo).
- `Project URL` → `VITE_SUPABASE_URL`.
- Se usó la **Publishable key** (`sb_publishable_...`), no la anon key legacy
  (JWT) — es lo que Supabase recomienda para proyectos nuevos. Funciona igual,
  protegida por RLS, no por secreto. → `VITE_SUPABASE_PUBLISHABLE_KEY`.

## 2. Esquema SQL

- Corrido en el SQL Editor. Confirmado en Table Editor: `profiles`, `incomes`,
  `expenses`, `credit_cards`, `card_expenses`, cada una con su política RLS
  "own rows" / "own profile" activa.

## 3. App en Clerk

- App **CuidaTuWallet** creada en "Jorge's Organization", instancia
  Development.
- Sign-in options: **Email** y **Google** habilitados (Google usa shared
  credentials de Clerk en dev — para producción hay que configurar credenciales
  propias de Google OAuth, ver nota abajo).
- `Publishable key` → `VITE_CLERK_PUBLISHABLE_KEY`.

## 4. Third-Party Auth (Clerk ↔ Supabase)

- Integración nativa (no JWT template, deprecado desde abril 2025).
- Activada desde `dashboard.clerk.com/setup/supabase`: reveló el Clerk domain
  `https://tolerant-terrapin-33.clerk.accounts.dev`.
- Agregado en Supabase: **Authentication → Sign In / Providers → Third-Party
  Auth → Clerk**, con ese domain. Status: `ENABLED`.

## 5. Variables de entorno

`.env` local ya tiene las 3 variables nuevas completas. Las 6 de Firebase
quedaron como placeholder (`tu_api_key`, etc.) — Jorge las completa a mano
desde su proyecto Firebase existente cuando corresponda probar la app
localmente antes de la Etapa 5.

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_dG9sZXJhbnQtdGVycmFwaW4tMzMuY2xlcmsuYWNjb3VudHMuZGV2JA
VITE_SUPABASE_URL=https://ybnorjqqmrgqfctkstiw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_rGV4mWdY47sWBs54Ov57Hg_16KeSUzW
```

## 6. Variables en Vercel

Hecho — las 3 variables nuevas están agregadas en el proyecto `cuida-tu-wallet`
(All Environments: Production, Preview, Development). No sensibles (son claves
públicas por diseño). No se hizo redeploy — el código en `main` todavía no las
usa, recién importa cuando esta rama se mergee.

## Nota para producción (Etapa 6 o antes de lanzar)

- El Google SSO de Clerk usa credenciales compartidas de desarrollo. Antes de
  pasar a producción hay que configurar un OAuth client propio de Google en
  Clerk (Configure → SSO connections → Google → credenciales propias).
- Clerk también requiere pasos adicionales para pasar la instancia de
  Development a Production (dominio propio, DNS). No se hizo en esta etapa.
