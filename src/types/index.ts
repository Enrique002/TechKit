export type CategoryId =
  | 'home'
  | 'hardware'
  | 'disks'
  | 'os'
  | 'processes'
  | 'network'
  | 'security'
  | 'maintenance'
  | 'downloadable'
  | 'guides'
  | 'favorites'
  | 'recent'
  | 'settings';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  description: string;
  iconName: string;
  isMainSection?: boolean;
}

export type ToolType =
  | 'native_techkit'
  | 'windows_builtin'
  | 'external_app'
  | 'technical_guide';

export type ImplementationStatus =
  | 'available'
  | 'pending'
  | 'requires_download'
  | 'requires_permissions'
  | 'unverified';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: CategoryId;
  type: ToolType;
  status: ImplementationStatus;
  compatibility: string;
  permissions?: string;
  officialUrl?: string;
  keywords: string[];
  instructions?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  compactMode: boolean;
  showPendingTools: boolean;
}

export interface RecentItem {
  toolId: string;
  timestamp: number;
}

export interface SystemSummary {
  hostname: string;
  username: string;
  osName: string;
  osVersion: string;
  architecture: string;
  appVersion: string;
  uptimeSeconds: number;
  lastUpdated: string;
}

export interface CpuInfo {
  model: string;
  physicalCores: number;
  logicalCores: number;
  architecture: string;
  globalUsagePercentage: number;
}

export interface MemoryInfo {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  availableBytes: number;
  usagePercentage: number;
}

export interface DiskVolume {
  mountPoint: string;
  name: string;
  fileSystem: string;
  totalBytes: number;
  availableBytes: number;
  usedBytes: number;
  usagePercentage: number;
  isRemovable: boolean;
}
