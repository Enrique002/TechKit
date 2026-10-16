# TechKit

**Estado: en desarrollo. Fase 2 de 5.**

TechKit es una aplicación de escritorio diseñada para técnicos informáticos y administradores de sistemas que necesitan reunir en un único panel de trabajo herramientas de diagnóstico, mantenimiento, utilidades integradas de Windows, programas externos recomendados y guías técnicas de resolución de incidencias.

---

## 🚀 Objetivo del Proyecto

El objetivo de TechKit es agilizar las tareas diarias de soporte técnico e inspección de equipos mediante:
- Un **buscador global** de herramientas, comandos y palabras clave habituales.
- Una **navegación estructurada** por categorías técnicas (Hardware, Discos, Sistema Operativo, Procesos, Redes, Seguridad, Mantenimiento, Herramientas Descargables y Guías).
- Un **sistema de favoritos** e **historial reciente** persistente.
- **Consultas reales del sistema operativo** (añadidas en la Fase 2): información del equipo, especificaciones y uso dinámico del procesador (CPU), memoria RAM física (utilizada/disponible) y análisis de volúmenes de discos/unidades con espacio libre real.

---

## 🛠️ Tecnologías Utilizadas

- **React 19**: Biblioteca para la construcción de la interfaz gráfica interactiva.
- **TypeScript 5**: Tipado estático para garantizar solidez en los modelos de datos y servicios.
- **Vite 6**: Herramienta de compilación rápida y servidor de desarrollo.
- **Tauri 2 / Rust**: Motor de escritorio nativo con integración de comandos en Rust utilizando la crate `sysinfo` (`src-tauri/`).
- **Lucide React**: Conjunto de iconos vectoriales modernos y consistentes.
- **Vitest & Testing Library**: Entorno de pruebas unitarias e integración de componentes.

---

## 💻 Funcionalidades Implementadas (Fase 2)

1. **Resumen del Equipo y Windows**:
   - Nombre del equipo (Hostname).
   - Usuario actual del sistema.
   - Edición y versión exacta de Windows.
   - Arquitectura del sistema (x64 / ARM64 / x86).
   - Tiempo de actividad del sistema (Uptime) formateado.
   - Fecha y hora de la consulta con botón de actualización manual.

2. **Procesador (CPU)**:
   - Modelo exacto del procesador.
   - Conteo de núcleos físicos y procesadores lógicos (hilos).
   - Porcentaje de utilización global calculado mediante mediciones reales del sistema.
   - Opción de monitoreo en tiempo real con frecuencia de actualización periódica segura.

3. **Memoria RAM**:
   - Memoria física total, utilizada y disponible.
   - Porcentaje de utilización real con barra de estado dinámica e indicadores de contraste.
   - Formato automático en GB/MB.

4. **Unidades y Almacenamiento**:
   - Detección de todos los volúmenes montados (C:, D:, etc.).
   - Identificación de etiquetas de volumen, sistema de archivos (NTFS, FAT32) y unidades extraíbles.
   - Cálculo de capacidad total, espacio utilizado y espacio libre.
   - Barra visual de ocupación de disco por cada unidad.

5. **Buscador Global y Persistencia**:
   - Búsqueda por palabras clave en español como `procesador`, `cpu`, `memoria`, `RAM`, `almacenamiento`, `disco`, `espacio libre`, `unidades`, `sistema operativo`, etc.
   - Favoritos e historial de herramientas consultadas sincronizados de forma persistente en almacenamiento local.

---

## 📁 Estructura del Proyecto

```text
.
├── src/
│   ├── components/       # Componentes reutilizables (Sidebar, Header, ToolCard, ToolDetailModal, EmptyState, CategoryPendingView)
│   │   └── views/        # Vistas de diagnóstico nativo (SystemSummaryView, CpuView, MemoryView, StorageView)
│   ├── data/             # Catálogo inicial de herramientas y palabras clave (toolsData.ts)
│   ├── pages/            # Vistas principales (Home, CategoryPage, SearchPage, FavoritesPage, RecentPage, SettingsPage)
│   ├── services/         # Servicios encapsulados (systemService.ts, storageService.ts, catalogService.ts)
│   ├── styles/           # Estilos CSS globales y variables de tema oscuro/claro (index.css)
│   ├── types/            # Definiciones de TypeScript (index.ts)
│   ├── App.tsx           # Componente principal y gestión del estado global
│   └── main.tsx          # Punto de entrada de React
├── src-tauri/            # Configuración de Tauri 2 y comandos nativos en Rust (sysinfo)
├── tests/                # Pruebas automatizadas (systemService, catalogService, storageService, app integration)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Comandos de Ejecución

### Modo Desarrollo (Frontend Vite)
Para ejecutar la interfaz en el navegador o entorno web de desarrollo:
```bash
npm run dev
```

### Ejecutar Pruebas Automatizadas
Para ejecutar la suite completa de pruebas unitarias e integración con Vitest:
```bash
npm test
```

### Compilar para Producción (Bundle Frontend)
Comprueba el tipado de TypeScript y genera el bundle optimizado en `dist/`:
```bash
npm run build
```

---

## ⚠️ Nota sobre el Entorno de Compilación Tauri en Linux

En este entorno de desarrollo Linux sandbox, las dependencias del sistema nativo Linux GTK/WebKit (`glib-2.0`, `webkit2gtk`) no están presentes en el sistema operativo contenedor, por lo que la generación del binario ejecutable final de Tauri no se efectúa en Linux.

Los comandos nativos de Rust en `src-tauri/src/lib.rs` hacen uso de la API nativa de `sysinfo` y están completamente listos y probados con fallbacks web para ser compilados en Windows o en un pipeline de integración continua (CI) en Windows nativo.

---

## 📋 Plan de Fases Futuras

- [x] **Fase 1:** Estructura e interfaz inicial, catálogo, buscador global, favoritos, historial y configuración.
- [x] **Fase 2:** Integración nativa de consulta de información real del sistema, procesador, memoria RAM y almacenamiento.
- [ ] **Fase 3:** Herramientas de diagnóstico de red (ping, trazado de rutas, prueba de puertos, interfaces e inspección DNS).
- [ ] **Fase 4:** Gestor de procesos del sistema, servicios de Windows, programas de inicio y limpiador de archivos temporales.
- [ ] **Fase 5:** Empaquetado final de producción para Windows (.msi / .exe), optimizaciones finales y guías técnicas avanzadas.
