# TechKit — Kit de Herramientas para Técnicos Informáticos

**Estado: Versión Final 1.0.0 (Fase 5 de 5 Completada).**

TechKit es una aplicación de escritorio para Windows diseñada para técnicos informáticos y administradores de sistemas que centraliza en una única interfaz herramientas de diagnóstico, monitorización de recursos, utilidades de red, cálculo de seguridad/hashes, mantenimiento y guías de resolución.

---

## 📐 Rediseño Visual Rectilíneo (Fase 5)

En la Fase 5, TechKit ha adoptado un **lenguaje visual rectilíneo y técnico**:
- **Geometría de 90 grados**: Todos los elementos de interfaz (tarjetas, botones, campos de búsqueda, modales, tablas, insignias, casillas de verificación, menús y barras de progreso) utilizan un radio de borde de `0px` (`border-radius: 0`).
- **Bordes limpios y alta legibilidad**: Separadores rectos y delgados para estructurar la interfaz sin recurrir a esquinas redondeadas o formas tipo cápsula decorativas.
- **Identidad cromática técnica**: Paleta oscura neutra con acento turquesa (`#00d2a0`), fuentes técnicas monoespaciadas para PIDs, IPs, MACs y Hashes, y soporte para tema claro y oscuro rectilíneos.

---

## 🛠️ Tecnologías Utilizadas

- **React 19**: Construcción de la interfaz gráfica interactiva.
- **TypeScript 5**: Tipado estático y solidez en modelos de datos.
- **Vite 6**: Servidor de desarrollo y empaquetador ultrarrápido.
- **Tauri 2 / Rust**: Motor nativo de escritorio con comandos optimizados utilizando las crates `sysinfo` y `serde`.
- **Lucide React**: Conjunto de iconos vectoriales limpios y geométricos.
- **Vitest & Testing Library**: Suite de 22 pruebas automatizadas.

---

## 💻 Funcionalidades Verificadas (Fases 1 a 5)

1. **Estructura y Navegación (Fase 1)**:
   - Navegación lateral por categorías técnicas y accesos rápidos.
   - Buscador global por palabras clave, comandos y categorías.
   - Sistema de **Favoritos** e **Historial Reciente** con persistencia en `localStorage`.
   - Selector de tema claro / oscuro y restablecimiento de preferencias.

2. **Sistema Operativo y Hardware (Fase 2)**:
   - Resumen del equipo: Hostname, usuario, edición de Windows, arquitectura y tiempo de actividad (Uptime).
   - Procesador (CPU): Modelo, núcleos físicos/lógicos, uso global en tiempo real y monitoreo periódico.
   - Memoria RAM: Capacidad física total, memoria usada, disponible y porcentaje con barra rectangular.
   - Discos y Almacenamiento: Volúmenes montados (C:, D:, etc.), etiquetas, sistema de archivos (NTFS/FAT32) y espacio libre.

3. **Procesos y Servicios (Fase 3)**:
   - Inspección de procesos activos ordenados por consumo de memoria y CPU con filtrado dinámico por nombre o PID.
   - Estado de servicios de Windows (WinDefend, Windows Update, Spooler, DHCP) y tipo de inicio.

4. **Redes y Conectividad (Fase 3)**:
   - Lista de adaptadores de red activos con direcciones IP, direcciones MAC y bytes enviados/recibidos.
   - **Herramienta de Ping e ICMP**: Prueba de latencia y tiempo de respuesta en ms para direcciones IP o dominios.

5. **Archivos y Seguridad (Fase 4)**:
   - **Calculadora de Hashes**: Cálculo instantáneo en memoria de huellas MD5, SHA-1 y SHA-256 para texto o archivos seleccionados.
   - **Verificación de Integridad**: Comparador de sumas de comprobación con indicador de coincidencia.
   - Inspección de estado de protección de Microsoft Defender y Firewall.

6. **Mantenimiento y Reparación (Fase 4)**:
   - **Limpiador de Archivos Temporales**: Detección y eliminación segura de caché de %TEMP% y archivos temporales del sistema previa confirmación explícita.
   - **Guía de Reparación SFC y DISM**: Guía y ejecución de comandos `sfc /scannow` y `DISM RestoreHealth`.

---

## ⚙️ Comandos de Desarrollo y Pruebas

### Modo Desarrollo (Vite Frontend)
```bash
npm run dev
```

### Ejecutar Pruebas Automatizadas
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

## 📦 Compilación y Distribución para Windows (.exe / .msi)

El flujo de Integración Continua (CI) mediante **GitHub Actions** está configurado en `.github/workflows/build.yml`.

Al hacer un commit o etiquetar una versión en GitHub, el flujo automático ejecuta:
1. Instalación de Node.js y Toolchain de Rust stable en `windows-latest`.
2. Ejecución de la suite de pruebas unitarias (`npm test`).
3. Compilación del bundle frontend (`npm run build`).
4. Generación del ejecutable y los instaladores mediante `tauri build`.
5. Publicación de los artefactos generados:
   - Ejecutable portátil: `src-tauri/target/release/techkit.exe`
   - Instalador MSI: `src-tauri/target/release/bundle/msi/TechKit_1.0.0_x64_en-US.msi`
   - Instalador NSIS: `src-tauri/target/release/bundle/nsis/TechKit_1.0.0_x64-setup.exe`

---

## ⚠️ NOTA SOBRE EL ENTORNO SANDBOX LINUX Y WINDOWS

En el contenedor ejecutor actual (entorno Linux sandbox), la compilación del binario `.exe` nativo de Windows no puede efectuarse directamente sin las herramientas cruzadas de Windows Target o un host Windows nativo. El flujo de GitHub Actions incluido permite compilar los instaladores `.exe` y `.msi` directamente en la nube Windows.
