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
    description: 'Cálculo de hashes (MD5, SHA256), permisos de archivos y comprobación de integridad',
    iconName: 'ShieldCheck',
  },
  {
    id: 'maintenance',
    name: 'Mantenimiento y reparación',
    description: 'Limpieza de temporales, reparación de archivos de sistema y optimización',
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
  // Resumen / Sistema operativo
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

  // Hardware y procesador
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

  // Discos y almacenamiento
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
  {
    id: 'disk-mgmt-win',
    name: 'Administrador de discos de Windows',
    description: 'Consola de administración de particiones y volúmenes de Windows (diskmgmt.msc).',
    category: 'disks',
    type: 'windows_builtin',
    status: 'available',
    compatibility: 'Windows todas las versiones',
    keywords: ['disco', 'particiones', 'formatear', 'volumen', 'diskmgmt'],
    instructions: 'Permite gestionar particiones y asignar letras de unidad en Windows.'
  },
  {
    id: 'disk-crystaldisk',
    name: 'CrystalDiskInfo (Externo)',
    description: 'Utilidad externa estándar para monitorizar el estado de salud S.M.A.R.T. de discos rígidos y SSD.',
    category: 'disks',
    type: 'external_app',
    status: 'requires_download',
    compatibility: 'Windows 10 / 11',
    officialUrl: 'https://crystalmark.info/en/software/crystaldiskinfo/',
    keywords: ['disco', 'crystaldisk', 'SMART', 'salud de disco', 'ssd', 'temperatura disco'],
    instructions: 'Visita el sitio oficial de CrystalMark para descargar la versión portable o instalable.'
  },

  // Procesos y servicios (Funcional en Fase 3)
  {
    id: 'proc-process-manager',
    name: 'Gestor de Procesos en Ejecución',
    description: 'Inspecciona procesos en tiempo real, PID, consumo de CPU/Memoria, ejecutable y finalización segura con confirmación.',
    category: 'processes',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar / Elevado según proceso',
    keywords: ['procesos', 'PID', 'CPU', 'memoria', 'finalizar proceso', 'proceso propietario', 'ejecutable', 'detener proceso'],
    instructions: 'Muestra procesos activos con ordenación, búsqueda y protección de procesos críticos de Windows.'
  },
  {
    id: 'proc-service-manager',
    name: 'Administrador de Servicios de Windows',
    description: 'Consulta servicios instalados, estados reales (en ejecución, detenido), tipos de inicio y control de estado seguro.',
    category: 'processes',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar / Administrador',
    keywords: ['servicios', 'estado servicio', 'iniciar servicio', 'detener servicio', 'tipo de inicio', 'sistema'],
    instructions: 'Inspecciona el catálogo de servicios de Windows con búsqueda y filtrado por estado.'
  },
  {
    id: 'proc-task-mgr',
    name: 'Administrador de Tareas de Windows',
    description: 'Acceso directo a la herramienta nativa de monitorización de procesos y rendimiento de Windows.',
    category: 'processes',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Usuario estándar',
    keywords: ['procesos', 'servicios', 'rendimiento', 'tarea', 'taskmgr', 'cpu', 'memoria RAM', 'PID'],
    instructions: 'Inspecciona la lista de tareas activas filtrando por nombre o número de proceso PID.'
  },
  {
    id: 'proc-process-explorer',
    name: 'Sysinternals Process Explorer',
    description: 'Avanzado gestor de procesos de Microsoft Sysinternals con árbol de dependencias y handles.',
    category: 'processes',
    type: 'external_app',
    status: 'requires_download',
    compatibility: 'Windows 10 / 11',
    officialUrl: 'https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer',
    keywords: ['procesos', 'sysinternals', 'process explorer', 'dll', 'handles', 'servicios'],
    instructions: 'Descarga directamente desde Microsoft Sysinternals.'
  },

  // Redes y conectividad (Funcional en Fase 3)
  {
    id: 'net-ip-config',
    name: 'Visor de Adaptadores e Interfaces de Red',
    description: 'Consulta adaptadores activos, direcciones IPv4 e IPv6, MAC, puerta de enlace predeterminada y servidores DNS.',
    category: 'network',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    keywords: ['redes', 'red', 'IP', 'direccion IP', 'mac', 'ethernet', 'wifi', 'gateway', 'DNS', 'conectividad'],
    instructions: 'Muestra el estado real de conexión de las interfaces físicas y virtuales del equipo.'
  },
  {
    id: 'net-ping-dns-tools',
    name: 'Herramientas de Diagnóstico de Red (Ping, DNS y Ruta)',
    description: 'Realiza pruebas de latencia (Ping ICMP), consulta resolución de nombres DNS y trazado de ruta de red.',
    category: 'network',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    keywords: ['ping', 'DNS', 'conectividad', 'latencia', 'trazado de ruta', 'traceroute', 'IP', 'red'],
    instructions: 'Ejecuta pruebas de conectividad de red con validaciones de seguridad sin inyección de comandos.'
  },
  {
    id: 'net-active-connections',
    name: 'Conexiones Activas, Puertos e Inspector',
    description: 'Visualiza sockets de red TCP y UDP activos, mapeo PID con procesos propietarios e inspector de puerto ocupado (1-65535).',
    category: 'network',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    keywords: ['conexiones', 'puertos', 'puerto ocupado', 'TCP', 'UDP', 'PID', 'LISTEN', 'ESTABLISHED', 'red'],
    instructions: 'Informa sobre conexiones en escucha y establecidas asociando el PID del proceso correspondiente.'
  },
  {
    id: 'net-wireshark',
    name: 'Wireshark (Externo)',
    description: 'Analizador de paquetes de red y captura de tráfico en tiempo real.',
    category: 'network',
    type: 'external_app',
    status: 'requires_download',
    compatibility: 'Windows 10 / 11',
    officialUrl: 'https://www.wireshark.org/',
    keywords: ['redes', 'wireshark', 'paquetes', 'trafico', 'puertos', 'conexion'],
    instructions: 'Herramienta de análisis profundo de protocolos de red.'
  },

  // Archivos y seguridad
  {
    id: 'sec-hash-calculator',
    name: 'Calculadora de Hashes y Verificador de Integridad',
    description: 'Genera huellas digitales MD5, SHA-1 y SHA-256 para verificar la integridad de archivos o cadenas de texto.',
    category: 'security',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Todas las plataformas',
    keywords: ['hash', 'archivos', 'sha256', 'md5', 'sha1', 'integridad', 'verificar'],
    instructions: 'Soporta cálculo automático de huellas digitales de archivos locales e igualación de sumas de comprobación.'
  },
  {
    id: 'sec-virustotal',
    name: 'Comprobador de Archivos VirusTotal',
    description: 'Acceso web para analizar la reputación de archivos sospechosos en más de 70 antivirus.',
    category: 'security',
    type: 'external_app',
    status: 'requires_download',
    compatibility: 'Navegador Web',
    officialUrl: 'https://www.virustotal.com/',
    keywords: ['hash', 'archivos', 'antivirus', 'seguridad', 'virustotal', 'malware'],
    instructions: 'Sube un archivo o pega su hash SHA256 en la plataforma oficial.'
  },

  // Mantenimiento y reparación
  {
    id: 'maint-temp-cleaner',
    name: 'Limpiador de Archivos Temporales',
    description: 'Identifica y elimina archivos temporales de usuario (%TEMP%) y caché del sistema de forma segura con confirmación.',
    category: 'maintenance',
    type: 'native_techkit',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    keywords: ['limpieza', 'mantenimiento', 'temporales', 'espacio', 'disco'],
    instructions: 'Libera espacio en disco eliminando archivos innecesarios previa confirmación explícita.'
  },
  {
    id: 'maint-sfc-scannow',
    name: 'Comprobador de Archivos de Sistema (SFC / DISM)',
    description: 'Guía y ejecución de los comandos sfc /scannow y DISM de Windows para escanear y reparar corrupción del sistema.',
    category: 'maintenance',
    type: 'windows_builtin',
    status: 'available',
    compatibility: 'Windows 10 / 11',
    permissions: 'Administrador requerido',
    keywords: ['mantenimiento', 'limpieza', 'errores de Windows', 'sfc', 'scannow', 'dism', 'recuperacion', 'reparacion'],
    instructions: 'Examina la integridad de todos los archivos protegidos del sistema.'
  },

  // Herramientas descargables
  {
    id: 'dl-7zip',
    name: '7-Zip Archivador',
    description: 'Compresor y descompresor de archivos de código abierto con alta tasa de compresión.',
    category: 'downloadable',
    type: 'external_app',
    status: 'requires_download',
    compatibility: 'Windows todas las versiones',
    officialUrl: 'https://www.7-zip.org/',
    keywords: ['archivos', 'compresor', 'zip', '7z', 'rar', 'descarga'],
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
    keywords: ['usb', 'booteable', 'iso', 'windows', 'rufus', 'descarga'],
    instructions: 'Descarga la versión portable oficial directamente sin instalación.'
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
  'procesos',
  'PID',
  'CPU',
  'memoria',
  'servicios',
  'conexiones',
  'puertos',
  'puerto ocupado',
  'red',
  'IP',
  'DNS',
  'ping',
  'conectividad',
  'TCP',
  'UDP',
  'almacenamiento',
  'sistema operativo'
];
