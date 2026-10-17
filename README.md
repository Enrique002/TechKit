# TechKit — Kit de Herramientas para Técnicos Informáticos

**Estado: en desarrollo.**

TechKit es una aplicación de escritorio diseñada para técnicos informáticos y administradores de sistemas que centraliza herramientas de diagnóstico, gestión de procesos y servicios, utilidades de red, mantenimiento y guías de resolución de incidencias en un panel unificado.

---

## Tecnologías Utilizadas

- **React 19**: Construcción de la interfaz gráfica interactiva.
- **TypeScript 5**: Tipado estático y solidez en modelos de datos.
- **Vite 6**: Servidor de desarrollo y empaquetador ultrarrápido.
- **Tauri 2 / Rust**: Motor nativo de escritorio con comandos optimizados utilizando las crates `sysinfo` y `serde`.
- **Lucide React**: Conjunto de iconos vectoriales limpios y geométricos.
- **Vitest & Testing Library**: Suite de 22 pruebas automatizadas.

---

## Funcionalidades Implementadas

1. **Gestor de Procesos de Windows**:
   - Consulta de procesos activos con PID, uso de CPU %, consumo de memoria RAM, ejecutable y usuario propietario.
   - Búsqueda en tiempo real por nombre de proceso, PID o ruta.
   - Ordenación dinámica por CPU, memoria, nombre o PID.
   - Actualización manual y refresco automático periódico seguro (3s).
   - Modal de detalles con opción de copiar la ruta completa del ejecutable.
   - Finalización segura de procesos con confirmación explícita y protección de procesos críticos del sistema (PID <= 4, `svchost.exe`, `explorer.exe`, etc.) tanto en frontend como en el backend en Rust.

2. **Servicios de Windows**:
   - Listado de servicios instalados con nombre interno, nombre descriptivo, estado real (`Running`, `Stopped`), tipo de inicio y descripción.
   - Búsqueda y filtrado por estado.
   - Control seguro para Iniciar o Detener servicios con confirmación explícita y avisos sobre requerimiento de permisos elevados de Administrador.

3. **Adaptadores e Interfaces de Red**:
   - Identificación de adaptadores Ethernet, Wi-Fi y virtuales.
   - Direcciones IPv4, IPv6, dirección MAC, puerta de enlace predeterminada y servidores DNS configurados.
   - Indicador dinámico de estado de conexión y fecha/hora de la última consulta.

4. **Herramientas de Diagnóstico de Conectividad**:
   - **Ping ICMP:** Prueba de latencia con métricas de tiempo mínimo, promedio y máximo en milisegundos, porcentaje de pérdida de paquetes y desglose de respuestas. Sanitización estricta de la entrada del usuario para prevenir inyección de comandos.
   - **Resolución DNS:** Consulta de nombres de dominio y desglose de direcciones IP asociadas con cálculo de tiempo de respuesta.
   - **Trazado de Ruta (Traceroute):** Mapeo de saltos intermedios y tiempo RTT.

5. **Conexiones Activas, Puertos e Inspector**:
   - Tabla de sockets de red activos en tiempo real (TCP/UDP, dirección y puerto local, dirección y puerto remoto, estado `LISTEN` / `ESTABLISHED`, PID y proceso asociado).
   - Buscador e Inspector de Puerto específico (validación de rango 1 - 65535) con explicación didáctica sobre puertos en escucha vs conexiones establecidas.
   - **Navegación cruzada bidireccional:** Enlace directo desde una conexión o puerto hacia el proceso correspondiente en el Gestor de Procesos mediante el PID, conservando el contexto.

1. **Estructura y Navegación (Fase 1)**:
   - Navegación lateral por categorías técnicas y accesos rápidos.
   - Buscador global por palabras clave, comandos y categorías.
   - Sistema de **Favoritos** e **Historial Reciente** con persistencia en `localStorage`.
   - Selector de tema claro / oscuro y restablecimiento de preferencias.

## Estructura del Proyecto

```text
.
├── src/
│   ├── components/       # Componentes reutilizables (Sidebar, Header, ToolCard, ToolDetailModal, EmptyState)
│   │   └── views/        # Vistas de diagnóstico nativo (SystemSummaryView, CpuView, MemoryView, StorageView, ProcessesView, ServicesView, NetworkView)
│   ├── data/             # Catálogo inicial de herramientas y palabras clave en español (toolsData.ts)
│   ├── pages/            # Vistas principales (Home, CategoryPage, SearchPage, FavoritesPage, RecentPage, SettingsPage)
│   ├── services/         # Servicios encapsulados (systemService, processService, windowServicesService, networkService, storageService, catalogService)
│   ├── styles/           # Estilos CSS globales y variables de tema oscuro/claro (index.css)
│   ├── types/            # Definiciones de TypeScript (index.ts)
│   ├── App.tsx           # Componente principal y gestión del estado global
│   └── main.tsx          # Punto de entrada de React
├── src-tauri/            # Configuración de Tauri 2 y comandos nativos en Rust (sysinfo, network)
├── tests/                # Pruebas automatizadas (systemService, processService, windowServicesService, networkService, catalogService, storageService, app integration)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Comandos de Desarrollo y Pruebas

### Modo Desarrollo (Vite Frontend)
```bash
npm run dev
```

### Ejecutar Pruebas Automatizadas
Para ejecutar la suite completa de 24 pruebas unitarias e integración con Vitest:
```bash
npm test
```

### Compilar Frontend para Producción
```bash
npm run build
```

### Compilar Aplicación Nativa con Tauri (requiere entorno Windows)
```bash
npm run tauri build
```

---

## ⚠️ Nota sobre Permisos y Entorno de Ejecución

- **Permisos Elevados:** Operaciones como detener ciertos procesos de otros usuarios o iniciar/detener servicios de Windows pueden requerir ejecutar TechKit con permisos de Administrador elevado (`Ejecutar como administrador`). Si los permisos son insuficientes, TechKit informará adecuadamente al usuario sin provocar bloqueos.
- **Entorno Linux Sandbox:** En entornos contenedores Linux donde no estén presentes dependencias GTK/WebKit de Tauri, la aplicación web funciona con un fallback de datos enriquecidos para desarrollo y pruebas.
