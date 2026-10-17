export type CategoryId =
  | 'home'
  | 'performance'
  | 'processes'
  | 'specs'
  | 'hardware'
  | 'disks'
  | 'os'
  | 'network'
  | 'security'
  | 'maintenance'
  | 'tools_catalog'
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

export interface ExternalToolItem {
  id: string;
  name: string;
  category: CategoryId;
  categoryDisplayName: string;
  shortDescription: string;
  mainFeatures: string[];
  solvesProblems: string[];
  licenseType: string;
  windowsCompatibility: string;
  requiresAdmin: boolean;
  officialUrl: string;
  installationStatus: 'installed' | 'not_detected' | 'unknown';
  executablePath?: string;
  warnings?: string;
}

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
  externalDetails?: ExternalToolItem;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  compactMode: boolean;
  showPendingTools: boolean;
  refreshIntervalSec: number;
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
  buildNumber: string;
  architecture: string;
  appVersion: string;
  uptimeSeconds: number;
  activationStatus: string;
  lastUpdated: string;
}

export interface CpuInfo {
  model: string;
  vendor: string;
  physicalCores: number;
  logicalCores: number;
  baseFrequencyGhz: number;
  currentFrequencyGhz: number;
  architecture: string;
  instructionsSupported: string[];
  globalUsagePercentage: number;
}

export interface MemoryInfo {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  availableBytes: number;
  committedBytes: number;
  pagedBytes: number;
  cachedBytes: number;
  usagePercentage: number;
  modules: Array<{
    slot: string;
    capacityBytes: number;
    speedMhz: number;
    type: string;
  }>;
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
  diskType: 'SSD' | 'HDD' | 'NVMe' | 'Desconocido';
  readSpeedMbps: number;
  writeSpeedMbps: number;
  smartHealth: string;
  temperatureC?: number;
  powerOnHours?: number;
}

export interface GpuInfo {
  model: string;
  vendor: string;
  dedicatedMemoryBytes: number;
  sharedMemoryBytes: number;
  usagePercentage: number;
  temperatureC?: number;
  powerDrawWatts?: number;
  driverVersion: string;
  displaysConnected: string[];
  availableNote?: string;
}

export interface NetworkPerformanceInfo {
  uploadBytesPerSec: number;
  downloadBytesPerSec: number;
  totalBytesSent: number;
  totalBytesReceived: number;
  activeInterfacesCount: number;
  connectionStatus: string;
}

export interface PerformanceSnapshot {
  timestamp: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUploadBps: number;
  networkDownloadBps: number;
  gpuUsage: number;
}

export interface ProcessInfo {
  pid: number;
  ppid?: number;
  name: string;
  cpuUsagePercentage: number;
  memoryBytes: number;
  virtualMemoryBytes?: number;
  readBytesPerSec?: number;
  writeBytesPerSec?: number;
  threadsCount: number;
  exePath: string;
  user: string;
  status: string;
  isCritical: boolean;
  startTime?: string;
  publisher?: string;
  isElevated?: boolean;
}

export interface ProcessKillResult {
  success: boolean;
  message: string;
  pid: number;
}

export interface WindowsServiceInfo {
  name: string;
  displayName: string;
  status: 'Running' | 'Stopped' | 'Paused' | 'StartPending' | 'StopPending' | 'Unknown';
  startType: 'Automatic' | 'Manual' | 'Disabled' | 'Unknown';
  description: string;
  isCritical: boolean;
}

export interface ServiceControlResult {
  success: boolean;
  message: string;
  serviceName: string;
  newStatus?: string;
}

export interface NetworkInterfaceInfo {
  id: string;
  name: string;
  adapterName: string;
  status: 'connected' | 'disconnected' | 'unknown';
  ipv4Addresses: string[];
  ipv6Addresses: string[];
  macAddress: string;
  gateway: string;
  dnsServers: string[];
  isVirtual: boolean;
}

export interface PingResult {
  target: string;
  packetsSent: number;
  packetsReceived: number;
  packetsLost: number;
  minRttMs?: number;
  avgRttMs?: number;
  maxRttMs?: number;
  success: boolean;
  error?: string;
  details: string[];
}

export interface DnsLookupResult {
  hostname: string;
  addresses: string[];
  status: 'success' | 'no_records' | 'dns_error' | 'execution_failed';
  errorMessage?: string;
  queryTimeMs: number;
}

export interface TraceHop {
  hopNumber: number;
  ip: string;
  hostname?: string;
  rttMs?: number;
  status: 'ok' | 'timeout' | 'error';
}

export interface TraceRouteResult {
  target: string;
  hops: TraceHop[];
  completed: boolean;
  error?: string;
}

export interface NetworkConnectionInfo {
  id: string;
  protocol: 'TCP' | 'UDP';
  localAddress: string;
  localPort: number;
  remoteAddress: string;
  remotePort: number;
  state: 'LISTEN' | 'ESTABLISHED' | 'CLOSE_WAIT' | 'TIME_WAIT' | 'SYN_SENT' | 'SYN_RECV' | 'FIN_WAIT1' | 'FIN_WAIT2' | 'CLOSING' | 'LAST_ACK' | 'UNKNOWN' | 'N/A';
  pid: number;
  processName?: string;
}

export interface MotherboardBiosInfo {
  manufacturer: string;
  model: string;
  biosVendor: string;
  biosVersion: string;
  biosReleaseDate: string;
  systemModel: string;
}
