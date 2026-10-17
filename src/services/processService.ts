import { invoke } from '@tauri-apps/api/core';
import { ProcessInfo, ProcessKillResult } from '../types';

const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Fallback process mock list for web environment & testing
const MOCK_PROCESSES: ProcessInfo[] = [
  {
    pid: 0,
    ppid: 0,
    name: "System Idle Process",
    cpuUsagePercentage: 78.5,
    memoryBytes: 8192,
    virtualMemoryBytes: 8192,
    readBytesPerSec: 0,
    writeBytesPerSec: 0,
    threadsCount: 1,
    exePath: "No accesible (Núcleo del sistema)",
    user: "NT AUTHORITY\\SYSTEM",
    status: "Running",
    isCritical: true,
    startTime: "Inicio del sistema",
    publisher: "Microsoft Corporation",
    isElevated: true,
  },
  {
    pid: 4,
    ppid: 0,
    name: "System",
    cpuUsagePercentage: 1.2,
    memoryBytes: 2580480,
    virtualMemoryBytes: 4194304,
    readBytesPerSec: 10240,
    writeBytesPerSec: 51200,
    threadsCount: 240,
    exePath: "C:\\Windows\\System32\\ntoskrnl.exe",
    user: "NT AUTHORITY\\SYSTEM",
    status: "Running",
    isCritical: true,
    startTime: "Inicio del sistema",
    publisher: "Microsoft Windows Publisher",
    isElevated: true,
  },
  {
    pid: 1234,
    ppid: 6100,
    name: "msedge.exe",
    cpuUsagePercentage: 8.4,
    memoryBytes: 485900288,
    virtualMemoryBytes: 850000000,
    readBytesPerSec: 154000,
    writeBytesPerSec: 24000,
    threadsCount: 38,
    exePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    user: "WORKSTATION\\TecnicoUsuario",
    status: "Running",
    isCritical: false,
    startTime: "10:15:32",
    publisher: "Microsoft Corporation",
    isElevated: false,
  },
  {
    pid: 2450,
    ppid: 800,
    name: "svchost.exe",
    cpuUsagePercentage: 0.8,
    memoryBytes: 52428800,
    virtualMemoryBytes: 120000000,
    readBytesPerSec: 0,
    writeBytesPerSec: 1024,
    threadsCount: 18,
    exePath: "C:\\Windows\\System32\\svchost.exe",
    user: "NT AUTHORITY\\SYSTEM",
    status: "Running",
    isCritical: true,
    startTime: "Inicio del sistema",
    publisher: "Microsoft Windows Publisher",
    isElevated: true,
  },
  {
    pid: 3892,
    ppid: 6100,
    name: "Code.exe",
    cpuUsagePercentage: 4.2,
    memoryBytes: 612000000,
    virtualMemoryBytes: 1100000000,
    readBytesPerSec: 45000,
    writeBytesPerSec: 120000,
    threadsCount: 42,
    exePath: "C:\\Users\\TecnicoUsuario\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe",
    user: "WORKSTATION\\TecnicoUsuario",
    status: "Running",
    isCritical: false,
    startTime: "09:40:11",
    publisher: "Microsoft Corporation",
    isElevated: false,
  },
  {
    pid: 5120,
    ppid: 6100,
    name: "cmd.exe",
    cpuUsagePercentage: 0.0,
    memoryBytes: 15400000,
    virtualMemoryBytes: 30000000,
    readBytesPerSec: 0,
    writeBytesPerSec: 0,
    threadsCount: 4,
    exePath: "C:\\Windows\\System32\\cmd.exe",
    user: "WORKSTATION\\TecnicoUsuario",
    status: "Running",
    isCritical: false,
    startTime: "11:02:00",
    publisher: "Microsoft Corporation",
    isElevated: false,
  },
  {
    pid: 6100,
    ppid: 800,
    name: "explorer.exe",
    cpuUsagePercentage: 1.5,
    memoryBytes: 184540000,
    virtualMemoryBytes: 350000000,
    readBytesPerSec: 2048,
    writeBytesPerSec: 8192,
    threadsCount: 65,
    exePath: "C:\\Windows\\explorer.exe",
    user: "WORKSTATION\\TecnicoUsuario",
    status: "Running",
    isCritical: true,
    startTime: "Inicio de sesión",
    publisher: "Microsoft Corporation",
    isElevated: false,
  },
];

export const processService = {
  async getProcesses(): Promise<ProcessInfo[]> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any[]>('get_processes');
        return res.map((p) => ({
          pid: p.pid,
          ppid: p.ppid,
          name: p.name || 'Desconocido',
          cpuUsagePercentage: parseFloat((p.cpu_usage_percentage || 0).toFixed(1)),
          memoryBytes: p.memory_bytes || 0,
          virtualMemoryBytes: p.virtual_memory_bytes || 0,
          readBytesPerSec: p.read_bytes_per_sec || 0,
          writeBytesPerSec: p.write_bytes_per_sec || 0,
          threadsCount: p.threads_count || 1,
          exePath: p.exe_path || 'No disponible',
          user: p.user || 'Desconocido',
          status: p.status || 'Running',
          isCritical: Boolean(p.is_critical),
          startTime: p.start_time || 'N/A',
          publisher: p.publisher || 'Desconocido / Sin firmar',
          isElevated: Boolean(p.is_elevated),
        }));
      } catch (err) {
        console.warn('Tauri invoke get_processes failed, using fallback:', err);
      }
    }
    return MOCK_PROCESSES;
  },

  async killProcess(pid: number): Promise<ProcessKillResult> {
    if (pid <= 4) {
      return {
        success: false,
        message: `El proceso con PID ${pid} es un proceso crítico del sistema operativo y no se puede finalizar.`,
        pid,
      };
    }

    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('kill_process', { pid });
        return {
          success: Boolean(res.success),
          message: res.message || 'Operación de finalización de proceso ejecutada.',
          pid: res.pid || pid,
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Error al intentar finalizar el proceso PID ${pid}: ${err?.message || err}`,
          pid,
        };
      }
    }

    // Mock response for web environment
    const target = MOCK_PROCESSES.find((p) => p.pid === pid);
    if (!target) {
      return {
        success: false,
        message: `El proceso con PID ${pid} no se encuentra activo o ha sido cerrado previamente.`,
        pid,
      };
    }

    if (target.isCritical) {
      return {
        success: false,
        message: `El proceso '${target.name}' (PID ${pid}) está protegido por TechKit como proceso crítico del sistema.`,
        pid,
      };
    }

    return {
      success: true,
      message: `Proceso '${target.name}' (PID ${pid}) finalizado con éxito (Entorno de pruebas web).`,
      pid,
    };
  },

  async killProcessTree(pid: number): Promise<ProcessKillResult> {
    if (pid <= 4) {
      return {
        success: false,
        message: `El proceso con PID ${pid} es crítico y su árbol de procesos no puede ser finalizado.`,
        pid,
      };
    }

    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('kill_process_tree', { pid });
        return {
          success: Boolean(res.success),
          message: res.message || 'Operación de finalización de árbol de procesos ejecutada.',
          pid: res.pid || pid,
        };
      } catch (err: any) {
        return {
          success: false,
          message: `Error al finalizar el árbol de procesos PID ${pid}: ${err?.message || err}`,
          pid,
        };
      }
    }

    const target = MOCK_PROCESSES.find((p) => p.pid === pid);
    if (!target) {
      return {
        success: false,
        message: `El proceso con PID ${pid} no se encuentra activo.`,
        pid,
      };
    }

    if (target.isCritical) {
      return {
        success: false,
        message: `El proceso '${target.name}' (PID ${pid}) es protegido del sistema.`,
        pid,
      };
    }

    return {
      success: true,
      message: `Árbol de procesos de '${target.name}' (PID ${pid}) y sus subprocesos dependientes finalizados correctamente.`,
      pid,
    };
  },
};
