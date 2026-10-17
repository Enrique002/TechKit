# TechKit

**Estado: en desarrollo. Fase 4 de 5.**

TechKit es una aplicación de escritorio diseñada para técnicos informáticos y administradores de sistemas que necesitan reunir en un único panel de trabajo herramientas de diagnóstico, mantenimiento, utilidades integradas de Windows, programas externos recomendados y guías técnicas de resolución de incidencias.

---

## 🚀 Criterios y Estado del Proyecto

- **Estado Actual:** TechKit en desarrollo, **Fase 4 de 5**, preparado para la fase 5 de integración, pruebas finales y preparación de la distribución.
- **Idioma del proyecto:** Todo el contenido visible para el usuario, mensajes y documentación se encuentran íntegramente en **español**.

---

## 🛠️ Tecnologías Utilizadas

- **React 19**: Biblioteca para la construcción de la interfaz gráfica interactiva.
- **TypeScript 5**: Tipado estático para garantizar solidez en los modelos de datos y servicios.
- **Vite 6**: Herramienta de compilación rápida y servidor de desarrollo.
- **Tauri 2 / Rust**: Motor de escritorio nativo con integración de comandos en Rust en `src-tauri/`.
- **Lucide React**: Conjunto de iconos vectoriales modernos y consistentes.
- **Vitest & Testing Library**: Entorno de pruebas unitarias e integración de componentes.

---

## 💻 Funcionalidades Implementadas (Fase 4)

1. **Análisis de Archivos y Diagnóstico de Tipos**:
   - Selección de archivos mediante el selector de archivos local.
   - Consulta de nombre, ruta completa, extensión, tamaño exacto en bytes, fechas de modificación y estado de acceso.
   - Distinción entre la extensión declarada y el tipo de archivo (MIME) identificado mediante su contenido real.
   - Advertencias de seguridad explícitas indicando que una extensión no garantiza que un archivo sea seguro.

2. **Cálculo e Integridad de Hashes**:
   - Cálculo de sumas de comprobación **SHA-256**, **SHA-512** y **MD5** sobre el contenido real del archivo.
   - Identificación expresa de MD5 como algoritmo antiguo no recomendado para garantizar seguridad criptográfica.
   - Acciones para copiar hashes al portapapeles.
   - Comparación del hash calculado del archivo con un hash esperado introducido por el usuario (normalizando espacios y mayúsculas/minúsculas).

3. **Comparación Directa de Archivos**:
   - Selección de dos archivos para comparación.
   - Evaluación de coincidencia de tamaños en bytes y cálculo de huellas digitales SHA-256.
   - Comunicación clara e inequívoca indicando si los archivos tienen contenido binario idéntico.

4. **Metadatos Básicos**:
   - Inspección de cabeceras de metadatos, versiones de archivo, versiones de producto y fabricante sin ejecutar el archivo.
   - Distinción entre información ausente y formatos no ejecutables/compatibles.

5. **Verificación de Firmas Digitales**:
   - Comprobación de cabeceras PKCS#7 y firmas digitales en ejecutables y librerías (`.exe`, `.dll`).
   - Muestra el estado de la firma (*Válida*, *Inválida*, *Sin firma*, *Desconocido*), el nombre del firmante y la entidad emisora.
   - Aclaración explícita de que un archivo sin firma digital no es necesariamente malicioso.

6. **Consulta de Estado de Microsoft Defender y Examen Bajo Demanda**:
   - Consulta informativa del estado del antivirus nativo, protección en tiempo real y fecha de actualización de firmas.
   - Acción explícita para solicitar un análisis antivirus bajo demanda mediante la utilidad oficial de Windows Defender con cuadro modal de confirmación previa.

7. **Herramientas de Mantenimiento de Windows (SFC y DISM)**:
   - Comprobador de archivos de sistema (`sfc /scannow`).
   - Administración de imágenes de Windows (DISM `CheckHealth`, `ScanHealth` y `RestoreHealth`).
   - Explicación de requisitos, necesidad de privilegios de administrador, objetivos y duración estimada.
   - Ejecución bajo demanda con cuadro de confirmación previo y posibilidad de cancelación.

8. **Limpieza Controlada de Archivos Temporales**:
   - Localización y consulta de ubicaciones temporales permitidas (`%TEMP%`, `Windows\Temp`, `Logs`).
   - Cálculo del espacio ocupado y vista previa con casillas de selección.
   - Re-validación inmediata de rutas antes de borrar y omisión explícita de archivos bloqueados.
   - Confirmación explícita antes de ejecutar la eliminación de temporales.

9. **Catálogo Mejorado e Integración con Buscador**:
   - Actualización de las palabras clave en español para el buscador global (`analizar archivo`, `hash`, `SHA-256`, `SHA-512`, `MD5`, `comparar archivos`, `metadatos`, `firma digital`, `certificado`, `Microsoft Defender`, `antivirus`, `malware`, `SFC`, `DISM`, `archivos temporales`, `limpieza`, `mantenimiento`, `herramientas externas`).

---

## ⚙️ Instrucciones de Desarrollo y Pruebas

### Ejecutar Pruebas Automatizadas
```bash
npm test
```

### Compilar Frontend para Producción
```bash
npm run build
```

### Pasos para Probar la Aplicación en Windows
1. Clona o descarga el repositorio en un equipo con Windows 10/11 de 64 bits.
2. Instala Node.js v18+ y las herramientas de desarrollo de Rust (`cargo`).
3. Ejecute `npm install` para instalar las dependencias de frontend.
4. Para ejecutar la aplicación en entorno de desarrollo nativo Tauri:
   ```bash
   npm run tauri dev
   ```

---

## ⚠️ Diferencias Importantes y Limitaciones Conocidas

1. **Hashes vs Análisis Antivirus:** El cálculo de hashes (SHA-256/SHA-512) sirve para comprobar la integridad del contenido o comparar archivos, pero no certifica la ausencia de malware. El análisis de malware requiere la consulta o examen mediante Microsoft Defender.
2. **Permisos Elevados:** Comandos como `sfc /scannow` o `DISM /Online /Cleanup-Image /RestoreHealth` requieren ejecutarse desde un proceso de Windows elevado como Administrador.
3. **Firmas Digitales:** La verificación de firmas digitales comprueba la autenticidad del emisor y la integridad del archivo ejecutable, pero no reemplaza un análisis de vulnerabilidades o malware.

---

## 📋 Plan de Fases Futuras

- [x] **Fase 1:** Estructura e interfaz inicial, catálogo, buscador global, favoritos, historial y configuración.
- [x] **Fase 2:** Integración nativa de consulta de información del sistema, procesador, memoria RAM y almacenamiento.
- [x] **Fase 3 / Fase 4 (actual):** Análisis de archivos, cálculo de hashes, comparación, metadatos, firmas digitales, estado de Microsoft Defender, herramientas de mantenimiento (SFC/DISM) y limpiador de temporales.
- [ ] **Fase 5:** Integración final de diagnósticos de red y procesos, revisión de seguridad, pruebas completas, corrección de errores y preparación de paquetes de distribución (.msi / .exe).
