# MEMORY.MD - Proyecto: Web App de Gestión para un Negocio (Bar/Rock Bar)

## 1. CONTEXTO DEL PROYECTO
Aplicación web responsive de punto de venta y administración para un bar, con enfoque en ambiente Rock. Permite gestionar mesas, pedidos, ventas directas, inventario, caja, gastos, reportes y permisos de usuarios.

**Estado Actual:** ETAPA 3 completada (Interfaz visual básica implementada)
**Versión Actual:** 0.2 (después de estructura y UI)
**Fecha de inicio:** 13 de octubre de 2026

---

## 2. DECISIONES TOMADAS (CRÍTICAS)

### Stack Tecnológico
- **Frontend:** Next.js 16.4.0 con App Router, TypeScript, Tailwind CSS
- **Base de datos y Auth:** Supabase + PostgreSQL + Supabase Auth
- **Estilización:** Tailwind CSS con clases personalizadas para tema "Rock Bar"
- **Iconos:** Lucide React
- **Despliegue:** Vercel (planes gratuitos) o desarrollo local
- **Formato de moneda:** Pesos Colombianos (COP) - `$`

### Arquitectura
- **Multi-tenant:** Cada negocio accesso solo a sus propios datos vía `business_id`
- **Seguridad:** Row Level Security (RLS) en todas las tablas expuestas
- **Entorno:** Variables de entorno en `.env.local` (nunca credenciales en cliente)
- **Compilación:** Next.js 16 con Turbopack en desarrollo

### Diseño Visual
- **Tema:** Rock Bar con colores: rojo oscuro (#7f1d1d), ámbar/amarillo, azul navy, fondo negro (#121214)
- **Componentes clave:** 
  - Sidebar navegación escritorio
  - MobileNav navegación inferior móvil
  - rock-gradient (gradientes principales)
  - rock-card (tarjetas con borde personalizado)
- **Estados de mesa:** Verde Emerald (disponible), Rojo (ocupada), Ámbar (reservada)

### Modelo de Datos (ETAPA 2)
- Tablas principales: businesses, profiles, tables, categories, products, orders, order_items, payments, cash_sessions, cash_movements, suppliers, inventory_movements, audit_logs, settings
- Tipos TypeScript definidos en `src/types/database.ts`
- Migración SQL: `supabase/migrations/001_initial_schema.sql`

### Forma de Trabajo
- **Incremental:** Etapas definidas (1-9)
- **Lint/TypeScript:** `npm run lint` y `npm run build` deben pasar limpio
- **Comandos:** `npm run dev`, `npm run build`, `npm run start`

---

## 3. ESTRUCTURA DE CARPETAS DEL PROYECTO

```
proyecto-bar/
├── AGENTS.md              # Instrucciones permanentes para agentes
├── .env.example           # Template de variables de entorno (sin credenciales)
├── .env.local             # Credenciales personales de Supabase (NO subir a Git)
├── package.json
├── tsconfig.json
├── tailwind.config.ts     # Configuración de Tailwind
├── postcss.config.mjs
├── next.config.ts
├── src/
│   ├── app/               # Páginas y rutas Next.js App Router
│   │   ├── layout.tsx     # Layout raíz con Sidebar y Header
│   │   ├── page.tsx     # Página principal (Dashboard)
│   │   ├── mesas/         # Rutas de mesas
│   │   ├── ventas/        # Rutas de ventas
│   │   ├── productos/     # Rutas de catálogo
│   │   ├── caja/          # Rutas de caja
│   │   ├── reportes/      # Rutas de reportes
│   │   └── configuracion/ # Configuración
│   ├── components/        # Componentes reutilizables
│   │   ├── Sidebar.tsx    # Navegación lateral escritorio
│   │   ├── MobileNav.tsx  # Navegación móvil
│   │   ├── Dashboard.tsx  # Panel principal
│   │   ├── StatCard.tsx   # Tarjetas de estadísticas
│   │   ├── TableCard.tsx  # Tarjetas de mesas
│   │   └── ProductGrid.tsx # Grid de productos
│   ├── lib/               # Lógica y utilidades
│   │   ├── supabase/      # Clientes de Supabase
│   │   │   ├── client.ts  # Cliente para navegador
│   │   │   └── server.ts  # Cliente para servidor
│   │   └── utils.ts       # Utilidades generales
│   └── types/             # Definiciones TypeScript
│       └── database.ts    # Interfaces del modelo de datos
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Migración SQL inicial
├── docs/
│   ├── PROJECT_PLAN.md    # Plan de desarrollo y etapas
│   ├── DATABASE_DESIGN.md # Diseño relacional detallado
│   └── ...                # Otra documentación
└── public/
    └── images/
        └── PruebaVisual.png  # Imagen de referencia visual
```

---

## 4. CONVENCIONES DE CODIGO

### TypeScript
- Tipado estricto en todas interfaces
- `noImplicitAny: true` en tsconfig
- Verificar tipos antes de renderizar

### Tailwind CSS
- Clases utilitarias-first
- Componentes personalizados en `globals.css`
- responsive design con prefijos sm, md, lg, xl
- Colores del tema: zinc, amber, red, emerald, blue-500 series

### Componentes de React/Next
- Componentes funcionales con hooks
- PropTypes/TypeScript para props
- `className` concatenado con clases base + variantes
- Componentes en mayúscula para exportación por defecto

### Seguridad (RLS)
- Todas las tablas tienen política RLS activada
- Los usuarios solo ven/ modifican datos de su `business_id`
- Verificación en servidor y base de datos (no confiar solo en frontend)

---

## 5. ETAPAS DE DESARROLLO PENDIENTES

| Etapa | Descripción | Estado |
|-------|-------------|--------|
| ETAPA 1 | Preparación, dependencias, estructura, documentación | ✅ Completa |
| ETAPA 2 | Modelo de datos, migraciones SQL, auth, RLS | ✅ Completa |
| ETAPA 3 | Interfaz visual, navegación, panel, mapa de mesas | ✅ Completa |
| ETAPA 4 | Catálogo productos, categorías, creación de pedidos | ✅ Completa |
| ETAPA 5 | Venta directa, cuentas por mesa, pagos parciales | ✅ Completa |
| ETAPA 6 | Caja, apertura/cierre turnos, gastos, retiros | ⏳ Próxima |
| ETAPA 7 | Inventario, compras, proveedores, ajustes | ⏳ Por iniciar |
| ETAPA 8 | Reportes, filtros, exportaciones, permisos | ⏳ Por iniciar |
| ETAPA 9 | Pruebas, seguridad, documentación, despliegue | ⏳ Por iniciar |

---

## 6. DECISIONES PENDIENTES POR DEFINIR

| Decisión | Estado | Próximo paso |
|----------|--------|------------|
| Nombre comercial del bar | Pendiente | Definir antes del despliegue |
| Número exacto de mesas y nombres | Pendiente | 1-9 iniciales, definir nombres reales |
| Catálogo inicial y precios reales | Pendiente | Cargar en Supabase en ETAPA 4 |
| Métodos de pago que utiliza el negocio | Pendiente | Definir en ETAPA 6 (efectivo, transferencia, tarjetas) |
| Necesidades de facturación electrónica | Pendiente | Evaluar módulo independiente (ETAPA 9) |
| Integración con facturación electrónica Colombia | Pendiente | Revisar requisitos legales |

---

## 7. COMANDOS DEL PROYECTO

```bash
# Desarrollo
npm run dev          # Inicia servidor local (puerto 3000)
npm run dev -- -p 3001  # Puerto alternativo si 3000 ocupado

# Build y producción
npm run build        # Compila para producción
npm run start        # Inicia servidor producción local
npm run lint         # Ejecuta ESLint

# Dependencias
npm install <pkg>    # Instalar dependencia
npm install -D <pkg> # Instalar devDependency

# Supabase
# (Ver documentación Supabase para credenciales y migraciones)
```

---

## 8. RECURSOS Y ENLAZES ÚTILES

- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Supabase:** https://supabase.com/docs
- **Lucide React:** https://lucide.dev/icons/
- **Proyecto Base:** /home/jesus/Documentos/Proyecto Bar

---

## 9. REGLA DE SEGURIDAD IMPORTANTE

> **Nunca incluir credenciales reales en commits o archivos versionados.**
> 
> El archivo `.env.local` está en el `.gitignore` y contiene:
> - `NEXT_PUBLIC_SUPABASE_URL`
> - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
> 
> Las claves de servicio (`service_role`) nunca deben exponerse en el cliente.

---

## 10. ULTIMAS ACTUALIZACIONES

- **13/10/2026:** ETAPA 3 completada - Interfaz visual Rock Bar operativa
- **13/10/2026:** Estructura de carpetas y Migración SQL inicial creada
- **13/10/2026:** Cliente Supabase configurado (`src/lib/supabase/`)
- **13/10/2026:** Tipos TypeScript definidos (`src/types/database.ts`)
- **13/10/2026:** Documentación inicial (AGENTS.md, PROJECT_PLAN.md, DATABASE_DESIGN.md)
- **13/10/2026:** Repositorio Git inicializado en rama `main` con `.env.local` protegido.
- **13/10/2026:** Corrección de advertencias ESLint en `layout.tsx`, `Sidebar.tsx` y `MobileNav.tsx` (0 errores, 0 warnings).
- **13/10/2026:** Modernización de `globals.css` a directiva nativa `@import "tailwindcss";` de Tailwind v4.
- **13/10/2026:** Servidor de desarrollo Next.js iniciado con éxito en http://localhost:3000 con Turbopack.
- **13/10/2026:** Corregida importación de `globals.css` en `src/app/layout.tsx` para habilitar estilos completos de Tailwind y diseño Rock Bar.
- **13/10/2026:** ETAPA 4 completada - Implementado Catálogo de productos y categorías en `/productos`, Punto de Venta y creación de pedidos en `/ventas`, mapa de mesas en `/mesas`, caja en `/caja`, reportes en `/reportes` y configuración en `/configuracion`. Modelos en `src/types/database.ts` completados. Build limpio con 0 warnings.
- **13/10/2026:** ETAPA 5 completada - Implementado módulo de Cuentas, Cobros, Pagos Parciales (Abonos) y Cierre en `/cobro`. Métodos de pago (Efectivo, Nequi/Daviplata, Datáfono, Transferencia), calculadora de vueltos, restricción de liberación de mesa hasta saldo $0. Integración fluida desde `/mesas` y `/ventas`. Build y linter limpios.
- **13/10/2026:** Interactividad total habilitada para operador único: botones funcionales para abrir mesas, tomar pedidos en vivo (`+`/`-`/eliminar), registrar pagos en efectivo con cálculo de vueltos, transferencias electrónicas, cierre y liberación de mesas, y sincronización en tiempo real con la caja. Implementado con `useSyncExternalStore` (0 errores, 0 warnings).
- **13/10/2026:** Funcionalidad completa de Gestión de Productos implementada:
  1. **Creación de nuevos productos:** Modal interactivo con validación de nombre, categoría (Cervezas, Licores, Cócteles, Snacks, Sin Alcohol), precio de venta, costo de compra, stock inicial, stock mínimo de alerta y SKU/código de barras. El nuevo producto se refleja al instante tanto en `/productos` como en la carta de `/ventas`.
  2. **Eliminación de productos:** Botón de papelera con confirmación que retira el producto del catálogo activo y actualiza las métricas en vivo.
  3. **Ajuste rápido de inventario:** Botones de `-1`, `+1` y `+10` (paquetes) por producto para actualizar existencias físicas sin recargar la página.
  4. **Punto de Venta (`/ventas`):** Botón de adición con 1 clic por producto, controles de incremento `+` y decremento `-` por ítem, botón individual de eliminar ítem de la comanda, y botón de vaciado total.
  5. **Validación:** Linter de ESLint en 0 errores y 0 warnings. Rutas estáticas con respuesta HTTP 200 OK.
- **13/10/2026:** Corrección crítica de reactividad en botones de Comanda y Pedidos:
  - **Causa raíz:** `useSyncExternalStore` comparaba la referencia en memoria del snapshot `cachedData`. Al mutar el objeto in-place antes de guardarlo, `Object.is(prev, next)` evaluaba como idéntico y React no re-renderizaba el estado tras hacer clic.
  - **Solución implementada:**
    1. Clonación inmutable en `saveBarData` (`JSON.parse(JSON.stringify(data))`), garantizando una nueva referencia de objeto para que `useSyncExternalStore` dispare re-renderizados instantáneos.
    2. Adición de suscriptores reactivos sincrónicos en memoria (`listeners: Set<() => void>`).
    3. Creación de funciones dedicadas en `barState.ts`: `addItemToTable`, `updateTableItemQty`, `removeTableItem`, `clearTableOrder` y `setActiveTableId`.
    4. Botón visible y destacado `+ Agregar a M{X}` en cada tarjeta de producto y feedback toast instantáneo.
    5. Botón de **"Vaciar Comanda"** visible tanto en la cabecera como en la parte inferior de las acciones en `/ventas`, devolviendo el stock físico de los productos a bodega automáticamente y reseteando el estado de la mesa a disponible si no hay pagos pendientes.
    6. Sincronización de mesa activa entre `/mesas` (`+ Pedido`) y `/ventas`. Compilación y build limpios con 0 errores.