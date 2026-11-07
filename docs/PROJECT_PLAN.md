# Plan de Proyecto - Sistema de Gestión para un Bar

Este documento detalla el plan de desarrollo incremental, los módulos del sistema y las decisiones pendientes del proyecto.

## 1. Módulos y Etapas de Desarrollo

- **ETAPA 1:** Preparación del proyecto, dependencias, configuración, estructura de carpetas y documentación. *(Completada)*
- **ETAPA 2:** Diseño del modelo de datos, migraciones SQL, autenticación y RLS inicial. *(Completada)*
- **ETAPA 3:** Diseño visual y navegación principal, panel y mapa de mesas inicial. *(Completada)*
- **ETAPA 4:** Catálogo de productos, categorías y creación de pedidos. *(Completada)*
- **ETAPA 5:** Venta directa, cuentas por mesa, pagos parciales y cierre de cuentas. *(Completada)*
- **ETAPA 6:** Caja, apertura y cierre de turnos, gastos, retiros, arqueos y cuadres. *(Completada)*
- **ETAPA 7:** Inventario, compras, proveedores y ajustes de existencias. *(Completada)*
- **ETAPA 8:** Reportes, filtros, sistema de login, control de acceso por roles (owner, admin, staff), portal de registro SaaS multinegocio e inicialización de cuentas 100% en CERO (0). *(Completada)*
- **ETAPA 9:** Sincronización multi-dispositivo en la nube con Supabase, prevención de correos duplicados, migración SQL 002 y despliegue en Vercel. *(En progreso - Conectado a Supabase)*
- **ETAPA 10:** Identidad visual del bar: Carga y compresión de fotos/logos en WebP, visualización en insignia de perfil, cabecera superior, barra lateral y módulo de configuración. *(Completada)*
- **ETAPA 11:** Inventario Dual Nevera vs. Bodega: Desglose de existencias frías y almacén, alertas de nevera baja, modal de transferencia rápida de bodega a nevera y sincronización con el punto de venta. *(Completada)*
- **ETAPA 12:** Reinicio Seguro Exclusivo de Mesas (`resetTablesOnly`), Descuentos y Happy Hours por Tipo de Local (conservando los predeterminados), Eliminación de Cuenta con Verificación de PIN y Base de Datos de Usuarios Eliminados (`deleted_bar_accounts`), Personalización de Interfaz por Negocio y Creación de Categorías de Productos Personalizadas. *(Completada)*
- **ETAPA 13:** Animación interactiva de borrado "The Bin Eats The Label" (Gulp Delete Button) inspirada en Code & Chill para la eliminación segura y con feedback visual de productos, mesas, categorías, promociones, empleados y cuentas. *(Completada)*
- **ETAPA 14:** Animación interactiva Double Slider Sign In / Sign Up en `/login` con panel overlay deslizante con gradiente Rock Bar, efecto parallax y carrusel móvil táctil adaptativo. *(Completada)*

## 2. Decisiones Pendientes (Registro)
| Decisión | Estado |
| :--- | :--- |
| Nombre comercial del bar | Resuelto (Personalizable en registro y configuración) |
| Nombre y estilo visual de la aplicación | Resuelto (Personalización de tema visual, tipo de local, icono, eslogan, foto y logotipo en perfil y sidebar) |
| Número exacto de mesas y nombres | Resuelto (Mesas y cuentas dinámicas personalizadas con nombre de cliente, sub-cuentas separadas y reinicio seguro exclusivo de mesas) |
| Categorías de productos y Descuentos / Happy Hours | Resuelto (Categorías dinámicas creadas por cada local + Descuentos predeterminados conservados y Happy Hours personalizados por negocio) |
| Eliminación de cuentas y auditoría de bajas | Resuelto (Verificación obligatoria con PIN del propietario y archivo en base de datos `deleted_bar_accounts`) |
| Animación de borrado interactiva (The Bin Eats The Label) | Resuelto (Implementado componente GulpDeleteButton en productos, mesas, usuarios, ventas y configuración) |
| Animación de transición Login <-> Sign Up | Resuelto (Implementado Double Slider con overlay deslizante y carrusel responsive en /login) |
| Catálogo inicial y precios reales | Pendiente |
| Métodos de pago que utiliza el negocio | Pendiente |
| Necesidades de facturación electrónica | Pendiente |
