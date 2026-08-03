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

Sidebar lateral izquierdo con:

1. **Home/Inicio**: muestra el dinero cargado (ej. sueldo) y cuánto queda
   disponible, descontando los gastos registrados.
2. **Tarjetas**: cards visuales tipo tarjeta física (Visa, Mastercard, Amex,
   Naranja X y otras tarjetas argentinas), mostrando banco y últimos 4 dígitos.
   Al tocar una tarjeta se accede a su detalle, donde se pueden cargar gastos
   manualmente o subiendo el resumen. Necesito una regla que lea el resumen y
   cargue los gastos automáticamente. Los resúmenes NO se guardan en ningún
   lado, solo se leen para extraer los gastos (esto debe estar aclarado en la UI).
   Cada gasto de tarjeta debe poder marcarse como propio o ajeno (préstamo de
   tarjeta a terceros), mostrando el total de cada uno por separado. Opción de
   borrar tarjetas con doble confirmación.
3. **Consumos** (nombre a definir): carga de gastos sueltos — carnicería,
   verdulería, suscripciones (Netflix, Spotify, etc.), transporte (SUBE, Uber) —
   que también descuentan del dinero disponible.
4. **Perfil** (ícono): editar nombre y fecha de nacimiento.

## Decisiones de diseño

- Paleta: índigo + esmeralda — primario #4F46E5, dark accent #312E81,
  positivo/ingreso #10B981, negativo/gasto #EF4444
- Tema oscuro por defecto con toggle a claro
- Sidebar lateral en desktop
- Fondo animado con gradiente sutil en login
- Onboarding con tooltips la primera vez que se usa cada sección del menú
- Sin foto de perfil — avatar con iniciales del nombre
- Ingresos tipo sueldo se archivan al vencer el mes, quedan en historial mes a mes
- Gráfico de torta en el dashboard para distribución de gastos
- Cada tarjeta de crédito tiene su propia página con sus gastos

## Reglas de trabajo

- Avanzar por etapas esperando mi confirmación antes de seguir, no generar
  todo junto
- Nunca tomar decisiones de diseño o arquitectura sin consultarme primero
- Primera línea de cada archivo: su path completo como comentario
- Sin console.log ni código de debug en el output final
- Avisar si un archivo supera las 150 líneas
- Separación de responsabilidades clara (I/O, lógica de negocio, presentación)
  adaptada a las convenciones de Next.js
