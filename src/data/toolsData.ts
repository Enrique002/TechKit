import { CategoryInfo, Tool } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'home',
    name: 'Inicio',
    description: 'Resumen del sistema y accesos rápidos de TechKit',
    iconName: 'Home',
    isMainSection: true,
  },
  {
    id: 'hardware',
    name: 'Hardware y temperaturas',
    description: 'Diagnóstico de procesador, GPU, memoria RAM y sensores de temperatura',
    iconName: 'Cpu',
  },
  {
    id: 'disks',
    name: 'Discos y almacenamiento',
    description: 'Estado de unidades, capacidad total, espacio libre y particiones',
    iconName: 'HardDrive',
  },
  {
    id: 'os',
    name: 'Sistema operativo',
    description: 'Información general del equipo, versión de Windows y tiempo de actividad',
    iconName: 'Monitor',
  },
  {
    id: 'processes',
    name: 'Procesos y servicios',
    description: 'Gestor de procesos, servicios de Windows y programas de inicio',
    iconName: 'Activity',
  },
  {
    id: 'network',
    name: 'Redes y conectividad',
    description: 'Dirección IP, prueba de latencia, consulta DNS y escaneo de puertos',
    iconName: 'Wifi',
  },
  {
    id: 'security',
    name: 'Archivos y seguridad',
    description: 'Análisis de archivos, cálculo de hashes, metadatos, firmas digitales y estado de Defender',
    iconName: 'ShieldCheck',
  },
  {
    id: 'maintenance',
    name: 'Mantenimiento y reparación',
    description: 'Comprobador de archivos de sistema SFC, reparación DISM y limpiador de temporales',
    iconName: 'Wrench',
  },
  {
    id: 'downloadable',
    name: 'Herramientas descargables',
    description: 'Utilidades esenciales de terceros con enlaces oficiales recomendados',
    iconName: 'Download',
  },
  {
    id: 'guides',
    name: 'Guías de resolución',
    description: 'Procedimientos paso a paso para resolver errores habituales de Windows',
    iconName: 'BookOpen',
  },
  {
    id: 'favorites',
    name: 'Favoritos',
    description: 'Acceso rápido a tus herramientas preferidas',
    iconName: 'Star',
    isMainSection: true,
  },
  {
    id: 'recent',
    name: 'Historial reciente',
    description: 'Herramientas consultadas recientemente',
    iconName: 'Clock',
    isMainSection: true,
  },
  {
    id: 'settings',
    name: 'Configuración',
    description: 'Preferencias visuales y opciones del sistema',
    iconName: 'Settings',
    isMainSection: true,
  },
];

export const INITIAL_TOOLS: Tool[] = [
  // Resumen / Sistema operativo (Fase 2)
  {
    id: 'sys-summary-info',
    name: 'Resumen del Equipo y Windows',
    description: 'Muestra el nombre del equipo, usuario actual, versión exacta de Windows, arquitectura y tiempo de actividad.',
    category: 'os',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11 (x64 / ARM64)',
    permissions: 'Usuario estándar',
    keywords: ['sistema', 'sistema operativo', 'información del equipo', 'equipo', 'windows', 'version', 'uptime', 'hostname', 'usuario'],
    instructions: 'Muestra información real del sistema obtenida mediante consultas de la API nativa de Windows en Rust.'
  },

  // Hardware y procesador (Fase 2)
  {
    id: 'hw-cpu-info',
    name: 'Información del Procesador (CPU)',
    description: 'Consulta el modelo exacto del procesador, núcleos físicos y lógicos, arquitectura y porcentaje de utilización actual.',
    category: 'hardware',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11 (x64 / ARM64)',
    permissions: 'Usuario estándar',
    keywords: ['procesador', 'cpu', 'nucleos', 'hilos', 'utilizacion', 'hardware', 'rendimiento'],
    instructions: 'Lee las métricas reales del procesador y calcula el uso dinámico del sistema.'
  },
  {
    id: 'hw-ram-info',
    name: 'Memoria RAM del Sistema',
    description: 'Muestra la capacidad física total, memoria utilizada, memoria disponible y porcentaje de ocupación.',
    category: 'hardware',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar',
    keywords: ['memoria', 'ram', 'memoria RAM', 'uso de memoria', 'disponible', 'hardware'],
    instructions: 'Representación visual del estado y consumo de la memoria física del equipo.'
  },
  {
    id: 'hw-hwinfo64',
    name: 'HWiNFO64 (Externo)',
    description: 'Herramienta profesional externa de diagnóstico e información detallada de hardware.',
    category: 'hardware',
    type: 'external_app',
    status: 'requires_download',
    compatibility: 'Windows 7 / 8 / 10 / 11',
    officialUrl: 'https://www.hwinfo.com/',
    keywords: ['hardware', 'hwinfo', 'sensores', 'temperatura', 'diagnostico'],
    instructions: 'Descarga HWiNFO64 desde la web oficial para un análisis minucioso de sensores de voltaje y frecuencia.'
  },

  // Discos y almacenamiento (Fase 2)
  {
    id: 'disk-storage-checker',
    name: 'Unidades y Almacenamiento',
    description: 'Analiza las unidades de disco instaladas, volúmenes, letras de montaje, sistema de archivos, capacidad total y espacio libre.',
    category: 'disks',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar',
    keywords: ['almacenamiento', 'disco', 'discos', 'unidades', 'espacio libre', 'capacidad', 'volumen', 'particiones', 'NTFS'],
    instructions: 'Examina todos los volúmenes de disco montados en el sistema y muestra barras de espacio libre.'
  },

  // Archivos y Seguridad (Fase 4 - Nativas disponibles)
  {
    id: 'sec-file-analysis',
    name: 'Análisis de Archivos y Tipos',
    description: 'Inspecciona un archivo local, muestra su tamaño, ruta, fechas y valida el tipo de contenido frente a la extensión.',
    category: 'security',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar',
    keywords: ['analizar archivo', 'archivo', 'metadatos', 'extension', 'mime', 'tamano', 'seguridad'],
    instructions: 'Seleccione un archivo local para examinar sus atributos de sistema de archivos.'
  },
  {
    id: 'sec-hash-calculator',
    name: 'Calculadora e Integridad de Hashes',
    description: 'Calcula huellas SHA-256, SHA-512 y MD5 sobre el contenido real del archivo e incluye validador de hashes.',
    category: 'security',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar',
    keywords: ['hash', 'SHA-256', 'SHA-512', 'MD5', 'integridad', 'copiar hash', 'comparar hash'],
    instructions: 'Permite copiar hashes al portapapeles y validar sumas de comprobación.'
  },
  {
    id: 'sec-file-compare',
    name: 'Comparación de Archivos',
    description: 'Compara dos archivos seleccionados contrastando sus tamaños y huellas criptográficas SHA-256.',
    category: 'security',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar',
    keywords: ['comparar archivos', 'comparacion', 'archivos idénticos', 'SHA-256', 'diferencia'],
    instructions: 'Selecciona dos archivos para comprobar si su contenido binario es idéntico.'
  },
  {
    id: 'sec-file-metadata',
    name: 'Consultar Metadatos de Archivos',
    description: 'Lee cabeceras de metadatos, versiones de producto y fabricante sin ejecutar el archivo.',
    category: 'security',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar',
    keywords: ['metadatos', 'version', 'fabricante', 'ejecutable', 'cabecera', 'producto'],
    instructions: 'Obtiene detalles de versión de ejecutables y librerías.'
  },
  {
    id: 'sec-digital-signature',
    name: 'Verificación de Firmas Digitales',
    description: 'Comprueba si un ejecutable o biblioteca posee firma PKCS#7 válida, mostrando el firmante y la entidad emisora.',
    category: 'security',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar',
    keywords: ['firma digital', 'certificado', 'firmante', 'valida', 'PKCS7', 'confianza'],
    instructions: 'Examina la autenticidad del firmante en el almacén de certificados.'
  },
  {
    id: 'sec-defender-status',
    name: 'Estado de Microsoft Defender y Análisis',
    description: 'Muestra la disponibilidad, protección en tiempo real y permite solicitar exámenes antivirus bajo demanda.',
    category: 'security',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar',
    keywords: ['Microsoft Defender', 'antivirus', 'malware', 'proteccion en tiempo real', 'analisis antivirus'],
    instructions: 'Permite realizar análisis bajo demanda previa confirmación del usuario.'
  },

  // Mantenimiento de Windows (Fase 4 - Nativas disponibles)
  {
    id: 'maint-sfc-dism-tools',
    name: 'Comprobador SFC y Reparación DISM',
    description: 'Ejecución guiada y controlada de sfc /scannow y comandos de mantenimiento DISM.',
    category: 'maintenance',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Administrador requerido',
    keywords: ['SFC', 'DISM', 'scannow', 'reparacion', 'archivos de sistema', 'imagen de windows', 'mantenimiento'],
    instructions: 'Requiere elevación de privilegios para efectuar reparaciones en la imagen de Windows.'
  },
  {
    id: 'maint-temp-cleaner-view',
    name: 'Limpiador de Archivos Temporales',
    description: 'Escanea carpetas temporales explícitamente permitidas y efectúa limpiezas previa vista previa y confirmación.',
    category: 'maintenance',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario / Administrador',
    keywords: ['archivos temporales', 'limpieza', 'mantenimiento', 'temporales', 'espacio libre', 'liberar disco'],
    instructions: 'Muestra una vista previa del espacio candidato antes de eliminar ningún elemento.'
  },

  // Catálogo Descargable Externo
  {
    id: 'dl-7zip',
    name: '7-Zip Archivador',
    description: 'Compresor y descompresor de archivos de código abierto con alta tasa de compresión.',
    category: 'downloadable',
    type: 'external_app',
    status: 'requires_download',
    compatibility: 'Windows todas las versiones',
    officialUrl: 'https://www.7-zip.org/',
    keywords: ['archivos', 'compresor', 'zip', '7z', 'rar', 'herramientas externas'],
    instructions: 'Obtén el instalador MSI oficial desde 7-zip.org.'
  },
  {
    id: 'dl-rufus',
    name: 'Rufus',
    description: 'Utilidad para crear unidades USB arrancables e instaladores de Windows o Linux.',
    category: 'downloadable',
    type: 'external_app',
    status: 'requires_download',
    compatibility: 'Windows 8 / 10 / 11',
    officialUrl: 'https://rufus.ie/',
    keywords: ['usb', 'booteable', 'iso', 'windows', 'rufus', 'herramientas externas'],
    instructions: 'Descarga la versión portable oficial directamente sin instalación.'
  },
  {
    id: 'dl-autoruns',
    name: 'Sysinternals AutoRuns',
    description: 'Muestra todas las aplicaciones, servicios y controladores configurados para iniciarse con Windows.',
    category: 'downloadable',
    type: 'external_app',
    status: 'requires_download',
    compatibility: 'Windows 10 / 11',
    officialUrl: 'https://learn.microsoft.com/en-us/sysinternals/downloads/autoruns',
    keywords: ['inicio', 'autoruns', 'sysinternals', 'procesos', 'herramientas externas'],
    instructions: 'Descarga desde el repositorio oficial de Microsoft Sysinternals.'
  },

  // Guías de resolución
  {
    id: 'guide-blue-screen',
    name: 'Guía de Diagnóstico de Pantallas Azules (BSOD)',
    description: 'Pasos recomendados para identificar la causa de un cuelgue del sistema mediante Minidumps.',
    category: 'guides',
    type: 'technical_guide',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    keywords: ['errores de Windows', 'bsod', 'pantalla azul', 'cuelgue', 'minidump', 'recuperacion'],
    instructions: `1. Identifica el código de alto nivel (ej. KMODE_EXCEPTION_NOT_HANDLED).
2. Localiza los archivos .dmp en la carpeta C:\\Windows\\Minidump.
3. Utiliza herramientas como BlueScreenView o WinDbg para analizar el controlador causante.
4. Si el error ocurre tras actualizar un driver, reinicia en Modo Seguro y revierte el controlador.`
  },
  {
    id: 'guide-network-reset',
    name: 'Guía para Solucionar Problemas de Red',
    description: 'Procedimiento metódico para restaurar el conjunto TCP/IP y la pila de sockets de red.',
    category: 'guides',
    type: 'technical_guide',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    keywords: ['redes', 'direccion IP', 'DNS', 'conexion', 'errores de Windows', 'puertos', 'recuperacion'],
    instructions: `1. Comprueba la conexión física o WiFi.
2. Abre la consola de comandos como Administrador.
3. Ejecuta "netsh winsock reset" y "netsh int ip reset".
4. Ejecuta "ipconfig /release" seguido de "ipconfig /renew".
5. Realiza "ipconfig /flushdns" y reinicia el equipo.`
  }
];

export const POPULAR_KEYWORDS = [
  'analizar archivo',
  'hash',
  'SHA-256',
  'SHA-512',
  'MD5',
  'comparar archivos',
  'metadatos',
  'firma digital',
  'certificado',
  'Microsoft Defender',
  'antivirus',
  'malware',
  'SFC',
  'DISM',
  'archivos temporales',
  'limpieza',
  'mantenimiento',
  'herramientas externas'
];
