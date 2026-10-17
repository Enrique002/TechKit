import { invoke } from '@tauri-apps/api/core';

export interface SystemProcess {
  pid: number;
  name: string;
  cpuPercentage: number;
  memoryBytes: number;
  status: string;
}

export interface SystemServiceItem {
  name: string;
  displayName: string;
  status: 'Running' | 'Stopped' | 'Paused';
  startType: 'Automatic' | 'Manual' | 'Disabled';
}

const MOCK_PROCESSES: SystemProcess[] = [
  { pid: 4, name: 'System', cpuPercentage: 0.5, memoryBytes: 1540000, status: 'Ejecutando' },
  { pid: 812, name: 'svchost.exe', cpuPercentage: 1.2, memoryBytes: 45200000, status: 'Ejecutando' },
  { pid: 1420, name: 'explorer.exe', cpuPercentage: 2.1, memoryBytes: 128000000, status: 'Ejecutando' },
  { pid: 2104, name: 'msedgewebview2.exe', cpuPercentage: 3.4, memoryBytes: 96000000, status: 'Ejecutando' },
  { pid: 3850, name: 'TechKit.exe', cpuPercentage: 0.8, memoryBytes: 54000000, status: 'Ejecutando' },
  { pid: 4120, name: 'dwm.exe', cpuPercentage: 1.5, memoryBytes: 85000000, status: 'Ejecutando' },
  { pid: 5210, name: 'MsMpEng.exe (Windows Defender)', cpuPercentage: 0.4, memoryBytes: 180000000, status: 'Ejecutando' },
  { pid: 6300, name: 'spoolsv.exe', cpuPercentage: 0.0, memoryBytes: 12000000, status: 'Ejecutando' },
];

const MOCK_SERVICES: SystemServiceItem[] = [
  { name: 'WinDefend', displayName: 'Servicio Antivirus de Microsoft Defender', status: 'Running', startType: 'Automatic' },
  { name: 'wuauserv', displayName: 'Windows Update', status: 'Running', startType: 'Automatic' },
  { name: 'Spooler', displayName: 'Cola de impresión (Print Spooler)', status: 'Running', startType: 'Automatic' },
  { name: 'EventLog', displayName: 'Registro de eventos de Windows', status: 'Running', startType: 'Automatic' },
  { name: 'Dhcp', displayName: 'Cliente DHCP', status: 'Running', startType: 'Automatic' },
  { name: 'Dnscache', displayName: 'Cliente DNS', status: 'Running', startType: 'Automatic' },
  { name: 'BITS', displayName: 'Servicio de transferencia inteligente en segundo plano', status: 'Stopped', startType: 'Manual' },
  { name: 'RemoteRegistry', displayName: 'Registro remoto', status: 'Stopped', startType: 'Disabled' },
];

const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const processService = {
  async getProcesses(): Promise<SystemProcess[]> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any[]>('get_process_list');
        return res.map((p) => ({
          pid: p.pid,
          name: p.name,
          cpuPercentage: parseFloat((p.cpu_usage || 0).toFixed(1)),
          memoryBytes: p.memory_bytes || 0,
          status: p.status || 'Ejecutando',
        }));
      } catch (err) {
        console.warn('Tauri get_process_list failed, using fallback:', err);
      }
    }
    return MOCK_PROCESSES;
  },

  async getServices(): Promise<SystemServiceItem[]> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any[]>('get_service_list');
        return res.map((s) => ({
          name: s.name,
          displayName: s.display_name || s.name,
          status: s.status === 'Running' ? 'Running' : 'Stopped',
          startType: s.start_type || 'Manual',
        }));
      } catch (err) {
        console.warn('Tauri get_service_list failed, using fallback:', err);
      }
    }
    return MOCK_SERVICES;
  },
};
