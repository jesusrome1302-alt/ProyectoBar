# AGENTS.md - Instrucciones permanentes del proyecto

Este archivo contiene las directrices, convenciones, arquitectura y comandos para el desarrollo de la aplicación web de gestión del bar.

## 1. Stack Tecnológico
- **Frontend / Fullstack:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **Base de datos y Auth:** Supabase + PostgreSQL + Supabase Auth.
- **Control de versiones:** Git y GitHub (`https://github.com/jesusrome1302-alt/ProyectoBar.git`).
- **Formato y Moneda:** Español (Colombia), Pesos Colombianos (COP `$`).

## 2. Comandos Principales
- `npm run dev`: Inicia el servidor de desarrollo local.
- `npm run build`: Compila la aplicación para producción.
- `npm run start`: Inicia el servidor de producción local.
- `npm run lint`: Ejecuta el linter de ESLint.

## 3. Arquitectura y Estructura de Carpetas
- `src/app/`: Rutas y páginas (Next.js App Router).
- `src/components/`: Componentes de interfaz reutilizables.
- `src/lib/`: Clientes de Supabase y funciones de utilidad.
- `src/types/`: Definiciones de TypeScript para la base de datos y modelos.
- `supabase/migrations/`: Scripts SQL versionados para la base de datos.
- `docs/`: Documentación del proyecto (plan, diseño de base de datos, guías).

## 4. Convenciones de Código y Seguridad
- Validar permisos en servidor y base de datos (Row Level Security - RLS).
- No guardar secretos en el cliente.
- Seguir un enfoque incremental paso a paso.
- **Aislamiento Multi-Bar y Estado en Cero:** Toda cuenta o bar registrado debe inicializarse en 0 absoluto (mesas limpias a $0, caja cerrada a $0, movimientos vacíos, sin productos o con plantilla bajo demanda) y con acceso exclusivo a su propio personal (sin usuarios demostrativos residuales).
- **Sincronización Central en la Nube:** Las cuentas y datos operativos se validan y persisten de forma centralizada en Supabase para evitar cuentas duplicadas entre diferentes dispositivos y mantener las mesas y ventas sincronizadas en tiempo real.
- **Identidad Visual y Compresión de Imágenes:** Las fotos y logotipos se procesan y comprimen en el cliente en formato WebP (máx 400x400 px, ~20-30KB) mediante HTML5 Canvas para optimizar el rendimiento, evitar saturación de almacenamiento y mantener sincronizado el perfil y el bar.
- **Inventario Dual Nevera vs. Bodega:** Los productos gestionan existencias divididas entre Nevera (unidades frías listas para servir) y Bodega (cajas en reserva). Las ventas descuentan prioritariamente de Nevera, las compras ingresan a Bodega, y las transferencias de Bodega a Nevera se auditan en el Kardex manteniendo la integridad de stock total = nevera + bodega.
- **Reinicio Seguro Exclusivo de Mesas (`resetTablesOnly`):** Al reiniciar las mesas desde `/mesas`, el sistema únicamente libera las mesas ocupadas/reservadas a `$0` y devuelve los ítems no cobrados a `stock_nevera`, **conservando el 100% de los productos, inventario, categorías, descuentos, proveedores, historial y configuración del negocio**.
- **Descuentos y Happy Hours Híbridos (Predeterminados + Personalizados por Local):** El sistema mantiene siempre inalterables los 5 descuentos/Happy Hours predeterminados (`PRESET_DISCOUNTS`, con `isPreset: true`) y permite que cada local cree, active/pausa o elimine sus propios descuentos y Happy Hours según su tipo de establecimiento, aplicables en `/ventas` y `/cobro`.
- **Eliminación de Cuenta con Verificación de PIN y Base de Datos de Usuarios Eliminados:** Para eliminar una cuenta de bar, se exige validar el PIN/contraseña del propietario. Al confirmarse, la cuenta se archiva con un snapshot de auditoría en la tabla `public.deleted_bar_accounts` (y respaldo local `ROCK_BAR_DELETED_ACCOUNTS_V1`) y se elimina de `public.bar_accounts` y `public.bar_data`.
- **Personalización de Interfaz y Categorías por Negocio:** Cada establecimiento puede personalizar su tipo de negocio (`businessType`), tema visual (`themePreset`: Rock Clásico, Esmeralda Gastrobar, Ámbar Cervecero, Neón Discoteca, Café Lounge), icono de marca (`brandIcon`), eslogan (`slogan`) y crear o gestionar sus propias categorías de productos (`categories`).
- **Animación de Borrado Gulp ("The Bin Eats The Label"):** Botón de eliminación animado (`GulpDeleteButton`) inspirado en Code & Chill, donde al hacer clic la tapa del bote de basura se abre, el texto de la etiqueta se separa letra por letra y vuela en parábola hacia la papelera, llenando el bote y cerrándose con un sello de confirmación al completarse la eliminación de productos, mesas, personal o cuentas.
- **Animación Double Slider Login / Sign Up:** En la pantalla de autenticación (`/login`), la transición entre Iniciar Sesión y Registro de Bar se realiza mediante un slider dual con panel overlay deslizante con gradiente (`auth-slider-box` y `auth-overlay-wrapper`), con efecto parallax en los textos descriptivos y botones ghost, adaptándose en pantallas móviles mediante un carrusel deslizante táctil con selector de píldora animado.
- **Sistema Global de Diálogos Modales Personalizados (`GlobalDialog` & `dialogService`):** Erradicación total de cuadros de diálogo nativos del navegador (`confirm()`, `alert()`, `prompt()`). Se sustituyen en todo el sistema por modales personalizados orientados a promesas asíncronas (`confirmAction`, `alertAction`, `promptAction`) integrados en el layout principal. Cuentan con diseño dark premium acorde al bar (backdrop blur, resplandor ambiental, insignias de estado, lista de garantías con viñetas esmeralda, soporte para inputs de texto y control por teclado `Enter`/`Escape`), previniendo que el navegador bloquee las alertas.
- **Tarjetas Dinámicas de Inventario, Alertas Duales (Nevera + Bodega) & Ajuste Rápido Persistente (`NotificationCenter` & `adjustProductStock`):** En `/productos`, las 5 métricas KPI mantienen alineación y espaciado simétrico (`p-4 min-h-[116px] flex flex-col justify-between`) con ambientación temática viva: "En Nevera" presenta efecto congelado bajo cero; "En Bodega" evoca un almacén cervecero y muta a modo de alerta (`animate-siren` + `hazard-stripe`) cuando la bodega se queda en `0` o cae por debajo de la reserva mínima; y "Nevera Baja" activa la sirena estroboscópica cuando faltan bebidas frías. El `NotificationCenter` de la cabecera alerta tanto por **Nevera Baja** (con botón `+6 a Nevera`) como por **Bodega Vacía/Baja** (con botón `+12 a Bodega`). Además, los botones de **Ajuste Rápido (`-`, `+`, `+10`)** en cada producto abren un modal rápido para elegir si las unidades van a **❄️ Nevera** o a **📦 Bodega**, actualizando `stock_nevera` o `stock_bodega` junto con `stock` total y registrando el movimiento en el Kardex para que persista de forma permanente.

## 5 Limites

- No crear rutas dinamicas
- No utilizar Server Actions
- No utilizar Edge Functions
- No utilizar Middleware
- No utilizar Componentes de Servidor
- No utilizar Componentes de Cliente
- No utilizar Server Components
- Siempre actualizar el MEMORY.MD y el AGENTS.MD para reflejar los cambios realizados en el proyecto
- Sempre actualizar el PROJECT_PLAN.MD con las etapas pendientes y completadas 

 
<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
