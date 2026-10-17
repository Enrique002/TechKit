import { invoke } from '@tauri-apps/api/core';
import { ProcessInfo, ProcessKillResult } from '../types';

const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

// Fallback process mock list for web environment & testing
const MOCK_PROCESSES: ProcessInfo[] = [
  {
    pid: 0,
    name: "System Idle Process",
    cpuUsagePercentage: 78.5,
    memoryBytes: 8192,
    exePath: "No accesible (Núcleo del sistema)",
    user: "NT AUTHORITY\\SYSTEM",
    status: "Running",
    isCritical: true,
  },
  {
    pid: 4,
    name: "System",
    cpuUsagePercentage: 1.2,
    memoryBytes: 2580480,
    exePath: "C:\\Windows\\System32\\ntoskrnl.exe",
    user: "NT AUTHORITY\\SYSTEM",
    status: "Running",
    isCritical: true,
  },
  {
    pid: 1234,
    name: "msedge.exe",
    cpuUsagePercentage: 8.4,
    memoryBytes: 485900288,
    exePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    user: "WORKSTATION\\TecnicoUsuario",
    status: "Running",
    isCritical: false,
  },
  {
    pid: 2450,
    name: "svchost.exe",
    cpuUsagePercentage: 0.8,
    memoryBytes: 52428800,
    exePath: "C:\\Windows\\System32\\svchost.exe",
    user: "NT AUTHORITY\\SYSTEM",
    status: "Running",
    isCritical: true,
  },
  {
    pid: 3892,
    name: "Code.exe",
    cpuUsagePercentage: 4.2,
    memoryBytes: 612000000,
    exePath: "C:\\Users\\TecnicoUsuario\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe",
    user: "WORKSTATION\\TecnicoUsuario",
    status: "Running",
    isCritical: false,
  },
  {
    pid: 5120,
    name: "cmd.exe",
    cpuUsagePercentage: 0.0,
    memoryBytes: 15400000,
    exePath: "C:\\Windows\\System32\\cmd.exe",
    user: "WORKSTATION\\TecnicoUsuario",
    status: "Running",
    isCritical: false,
  },
  {
    pid: 6100,
    name: "explorer.exe",
    cpuUsagePercentage: 1.5,
    memoryBytes: 184540000,
    exePath: "C:\\Windows\\explorer.exe",
    user: "WORKSTATION\\TecnicoUsuario",
    status: "Running",
    isCritical: true,
  },
];

export const processService = {
  async getProcesses(): Promise<ProcessInfo[]> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any[]>('get_processes');
        return res.map((p) => ({
          pid: p.pid,
          name: p.name || 'Desconocido',
          cpuUsagePercentage: parseFloat((p.cpu_usage_percentage || 0).toFixed(1)),
          memoryBytes: p.memory_bytes || 0,
          exePath: p.exe_path || 'No disponible',
          user: p.user || 'Desconocido',
          status: p.status || 'Running',
          isCritical: Boolean(p.is_critical),
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
};
