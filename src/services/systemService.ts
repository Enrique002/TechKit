import { invoke } from '@tauri-apps/api/core';
import { SystemSummary, CpuInfo, MemoryInfo, DiskVolume } from '../types';

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0 || !isFinite(bytes) || isNaN(bytes)) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
  return `${val} ${sizes[i] || 'B'}`;
}

export function formatUptime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(' ');
}

export function safePercentage(used: number, total: number): number {
  if (!total || total <= 0 || !isFinite(total) || isNaN(total)) return 0;
  if (!used || used < 0 || !isFinite(used) || isNaN(used)) return 0;
  const pct = (used / total) * 100;
  return Math.min(100, Math.max(0, parseFloat(pct.toFixed(1))));
}

// Fallback mock data for web browser environment or testing
const MOCK_SUMMARY: SystemSummary = {
  hostname: 'WORKSTATION-WIN',
  username: 'TecnicoUsuario',
  osName: 'Microsoft Windows 11 Pro',
  osVersion: '10.0.22631 Build 22631',
  architecture: 'x64 (AMD64)',
  appVersion: '0.2.0 (Fase 2)',
  uptimeSeconds: 14520,
  lastUpdated: new Date().toLocaleTimeString(),
};

const MOCK_CPU: CpuInfo = {
  model: 'Intel(R) Core(TM) i7-12700K 12th Gen @ 3.60GHz',
  physicalCores: 12,
  logicalCores: 20,
  architecture: 'x86_64',
  globalUsagePercentage: 18.5,
};

const MOCK_MEMORY: MemoryInfo = {
  totalBytes: 34359738368, // 32 GB
  usedBytes: 13958643712,  // ~13 GB
  freeBytes: 20401094656,
  availableBytes: 20401094656,
  usagePercentage: 40.6,
};

const MOCK_DISKS: DiskVolume[] = [
  {
    mountPoint: 'C:',
    name: 'Sistema OS',
    fileSystem: 'NTFS',
    totalBytes: 512110190592, // 512 GB
    availableBytes: 182536110080, // ~182 GB free
    usedBytes: 329574080512,
    usagePercentage: 64.3,
    isRemovable: false,
  },
  {
    mountPoint: 'D:',
    name: 'Datos Trabajo',
    fileSystem: 'NTFS',
    totalBytes: 1000204886016, // 1 TB
    availableBytes: 450123456789,
    usedBytes: 550081429227,
    usagePercentage: 55.0,
    isRemovable: false,
  },
];

const isTauriEnv = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const systemService = {
  async getSystemSummary(): Promise<SystemSummary> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('get_system_summary');
        return {
          hostname: res.hostname || 'Desconocido',
          username: res.username || 'Usuario',
          osName: res.os_name || 'Windows',
          osVersion: res.os_version || 'N/A',
          architecture: res.architecture || 'x64',
          appVersion: res.app_version || '0.2.0',
          uptimeSeconds: res.uptime_seconds || 0,
          lastUpdated: new Date().toLocaleTimeString(),
        };
      } catch (err) {
        console.warn('Tauri invoke get_system_summary failed, using fallback:', err);
      }
    }
    return {
      ...MOCK_SUMMARY,
      lastUpdated: new Date().toLocaleTimeString(),
    };
  },

  async getCpuInfo(): Promise<CpuInfo> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('get_cpu_info');
        return {
          model: res.model || 'Procesador x64',
          physicalCores: res.physical_cores || 1,
          logicalCores: res.logical_cores || 1,
          architecture: res.architecture || 'x86_64',
          globalUsagePercentage: safePercentage(res.global_usage_percentage, 100),
        };
      } catch (err) {
        console.warn('Tauri invoke get_cpu_info failed, using fallback:', err);
      }
    }
    return MOCK_CPU;
  },

  async getMemoryInfo(): Promise<MemoryInfo> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('get_memory_info');
        const total = res.total_bytes || 0;
        const used = res.used_bytes || 0;
        return {
          totalBytes: total,
          usedBytes: used,
          freeBytes: res.free_bytes || 0,
          availableBytes: res.available_bytes || 0,
          usagePercentage: safePercentage(used, total),
        };
      } catch (err) {
        console.warn('Tauri invoke get_memory_info failed, using fallback:', err);
      }
    }
    return MOCK_MEMORY;
  },

  async getDiskInfo(): Promise<DiskVolume[]> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any[]>('get_disk_info');
        return res.map((d) => {
          const total = d.total_bytes || 0;
          const used = d.used_bytes || 0;
          return {
            mountPoint: d.mount_point || 'C:',
            name: d.name || 'Disco Local',
            fileSystem: d.file_system || 'NTFS',
            totalBytes: total,
            availableBytes: d.available_bytes || 0,
            usedBytes: used,
            usagePercentage: safePercentage(used, total),
            isRemovable: Boolean(d.is_removable),
          };
        });
      } catch (err) {
        console.warn('Tauri invoke get_disk_info failed, using fallback:', err);
      }
    }
    return MOCK_DISKS;
  },
};
