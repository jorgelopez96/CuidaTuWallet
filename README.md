# CuidaTuWallet

App para medir y controlar tus gastos mensuales.

## Stack

- React 18 + Vite
- React Router DOM v6
- Context API + useReducer
- Firebase Auth + Firestore
- Tailwind CSS
- ESLint + Prettier
- Deploy: Vercel

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Completar con las credenciales de tu proyecto Firebase

# 3. Levantar en desarrollo
npm run dev
```

## Variables de entorno

Ver `.env.example` — todas son obligatorias. La app falla en arranque si alguna falta.

## Estructura

```
src/
├── config/       → Firebase, constantes, validación de env
├── context/      → Un contexto por dominio + AppProviders
├── hooks/        → Lógica de negocio, conectan services con contexts
├── services/     → Solo I/O con Firebase, naming por dominio
├── components/
│   └── ui/       → Componentes presentacionales reutilizables
├── pages/        → Vistas conectadas a hooks, sin lógica compleja
├── router/       → AppRouter + PrivateRoute desacoplado
└── utils/        → Helpers puros (formato de moneda, fechas)
```

## Flujo de datos

```
UI → hook → service (Firebase) → hook → dispatch → context → UI
```

Unidireccional. La UI siempre lee del context, nunca del service directamente.

## Scripts

```bash
npm run dev       # Desarrollo
npm run build     # Build de producción
npm run lint      # ESLint
npm run format    # Prettier
```
