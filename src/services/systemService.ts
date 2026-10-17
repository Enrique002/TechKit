import { invoke } from '@tauri-apps/api/core';
import { SystemSummary, CpuInfo, MemoryInfo, DiskVolume, GpuInfo, MotherboardBiosInfo } from '../types';

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

const MOCK_SUMMARY: SystemSummary = {
  hostname: 'WORKSTATION-WIN',
  username: 'TecnicoUsuario',
  osName: 'Microsoft Windows 11 Pro',
  osVersion: '23H2 (Build 22631.3593)',
  buildNumber: '22631.3593',
  architecture: 'x64 (AMD64)',
  appVersion: '1.0.0 Pro',
  uptimeSeconds: 14520,
  activationStatus: 'Windows está activado con una licencia digital',
  lastUpdated: new Date().toLocaleTimeString(),
};

const MOCK_CPU: CpuInfo = {
  model: 'Intel(R) Core(TM) i7-12700K 12th Gen @ 3.60GHz',
  vendor: 'GenuineIntel',
  physicalCores: 12,
  logicalCores: 20,
  baseFrequencyGhz: 3.61,
  currentFrequencyGhz: 4.20,
  architecture: 'x86_64',
  instructionsSupported: ['MMX', 'SSE', 'SSE2', 'SSE3', 'SSSE3', 'SSE4.1', 'SSE4.2', 'AVX', 'AVX2', 'FMA3', 'VT-x'],
  globalUsagePercentage: 18.5,
};

const MOCK_MEMORY: MemoryInfo = {
  totalBytes: 34359738368, // 32 GB
  usedBytes: 13958643712,  // ~13 GB
  freeBytes: 20401094656,
  availableBytes: 20401094656,
  committedBytes: 18253611008,
  pagedBytes: 2147483648,
  cachedBytes: 4294967296,
  usagePercentage: 40.6,
  modules: [
    { slot: 'DIMM 1', capacityBytes: 17179869184, speedMhz: 3200, type: 'DDR4' },
    { slot: 'DIMM 3', capacityBytes: 17179869184, speedMhz: 3200, type: 'DDR4' },
  ],
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
    diskType: 'NVMe',
    readSpeedMbps: 245.5,
    writeSpeedMbps: 84.2,
    smartHealth: 'Bueno (100%)',
    temperatureC: 38,
    powerOnHours: 2450,
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
    diskType: 'SSD',
    readSpeedMbps: 12.0,
    writeSpeedMbps: 4.5,
    smartHealth: 'Bueno (98%)',
    temperatureC: 34,
    powerOnHours: 5100,
  },
];

const MOCK_GPU: GpuInfo = {
  model: 'NVIDIA GeForce RTX 5080',
  vendor: 'NVIDIA Corporation',
  dedicatedMemoryBytes: 17179869184, // 16 GB
  sharedMemoryBytes: 34359738368,   // 32 GB
  usagePercentage: 18.0,
  temperatureC: 39,
  powerDrawWatts: 110,
  driverVersion: '555.99 (WHQL)',
  displaysConnected: ['DisplayPort 1: 3840x2160 @ 144Hz (NVIDIA G-SYNC)'],
};

const MOCK_MOTHERBOARD: MotherboardBiosInfo = {
  manufacturer: 'ASUSTeK COMPUTER INC.',
  model: 'PRIME Z690-P D4',
  biosVendor: 'American Megatrends Inc.',
  biosVersion: '2204',
  biosReleaseDate: '11/15/2023',
  systemModel: 'System Product Name',
};

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
          buildNumber: res.build_number || '22631.3593',
          architecture: res.architecture || 'x64',
          appVersion: res.app_version || '1.0.0 Pro',
          uptimeSeconds: res.uptime_seconds || 0,
          activationStatus: res.activation_status || 'Activado (Licencia digital)',
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
          vendor: res.vendor || 'Intel/AMD',
          physicalCores: res.physical_cores || 1,
          logicalCores: res.logical_cores || 1,
          baseFrequencyGhz: res.base_frequency_ghz || 3.6,
          currentFrequencyGhz: res.current_frequency_ghz || 3.6,
          architecture: res.architecture || 'x86_64',
          instructionsSupported: res.instructions_supported || ['x86_64', 'AVX2'],
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
          committedBytes: res.committed_bytes || total * 0.6,
          pagedBytes: res.paged_bytes || 2147483648,
          cachedBytes: res.cached_bytes || 4294967296,
          usagePercentage: safePercentage(used, total),
          modules: res.modules || MOCK_MEMORY.modules,
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
            diskType: d.disk_type || 'SSD',
            readSpeedMbps: d.read_speed_mbps || 0,
            writeSpeedMbps: d.write_speed_mbps || 0,
            smartHealth: d.smart_health || 'Bueno (100%)',
            temperatureC: d.temperature_c,
            powerOnHours: d.power_on_hours,
          };
        });
      } catch (err) {
        console.warn('Tauri invoke get_disk_info failed, using fallback:', err);
      }
    }
    return MOCK_DISKS;
  },

  async getGpuInfo(): Promise<GpuInfo> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('get_gpu_info');
        return {
          model: res.model || 'Adaptador de pantalla básico',
          vendor: res.vendor || 'Microsoft/NVIDIA/AMD/Intel',
          dedicatedMemoryBytes: res.dedicatedMemoryBytes ?? res.dedicated_memory_bytes ?? 0,
          sharedMemoryBytes: res.sharedMemoryBytes ?? res.shared_memory_bytes ?? 0,
          usagePercentage: res.usagePercentage ?? res.usage_percentage ?? 0,
          temperatureC: res.temperatureC ?? res.temperature_c,
          powerDrawWatts: res.powerDrawWatts ?? res.power_draw_watts,
          driverVersion: res.driverVersion ?? res.driver_version ?? 'WHQL',
          displaysConnected: res.displaysConnected ?? res.displays_connected ?? ['Pantalla principal'],
          availableNote: res.availableNote ?? res.available_note,
        };
      } catch (err) {
        console.warn('Tauri invoke get_gpu_info failed, using fallback:', err);
      }
    }
    return MOCK_GPU;
  },

  async getMotherboardInfo(): Promise<MotherboardBiosInfo> {
    if (isTauriEnv()) {
      try {
        const res = await invoke<any>('get_motherboard_info');
        return {
          manufacturer: res.manufacturer || 'Fabricante del sistema',
          model: res.model || 'Modelo de placa base',
          biosVendor: res.bios_vendor || 'BIOS Vendor',
          biosVersion: res.bios_version || '1.0.0',
          biosReleaseDate: res.bios_release_date || 'N/A',
          systemModel: res.system_model || 'System Model',
        };
      } catch (err) {
        console.warn('Tauri invoke get_motherboard_info failed, using fallback:', err);
      }
    }
    return MOCK_MOTHERBOARD;
  },
};
