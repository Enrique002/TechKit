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

// Phase 3 Data Models

export interface ProcessInfo {
  pid: number;
  name: string;
  cpuUsagePercentage: number;
  memoryBytes: number;
  exePath: string;
  user: string;
  status: string;
  isCritical: boolean;
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
