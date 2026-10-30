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
