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

// ==========================================
// Phase 4 Types: File Analysis, Security & Maintenance
// ==========================================

export interface FileAnalysisInfo {
  name: string;
  path: string;
  extension: string;
  sizeBytes: number;
  identifiedMimeType: string;
  modifiedDate: string;
  createdDate: string;
  accessStatus: 'accessible' | 'locked' | 'inaccessible' | 'not_found';
  extensionMimeMatch: boolean;
  accessNotes?: string;
}

export interface FileHashes {
  path: string;
  fileName: string;
  md5: string;
  sha256: string;
  sha512: string;
  calculationDate: string;
  status: 'completed' | 'error' | 'modified_during_read';
  statusNotes?: string;
}

export interface FileComparisonResult {
  file1Path: string;
  file2Path: string;
  file1Size: number;
  file2Size: number;
  sizesMatch: boolean;
  file1Sha256: string;
  file2Sha256: string;
  hashesMatch: boolean;
  areIdentical: boolean;
  comparisonMethod: 'hash_and_byte_by_byte';
  details: string;
}

export interface FileMetadata {
  name: string;
  extension: string;
  sizeBytes: number;
  createdDate: string;
  modifiedDate: string;
  fileType: string;
  publisher?: string;
  productDescription?: string;
  fileVersion?: string;
  productVersion?: string;
  hasExecutableHeader: boolean;
  status: 'available' | 'no_metadata' | 'unsupported_format' | 'read_error';
  notes?: string;
}

export type DigitalSignatureStatus = 'valid' | 'invalid' | 'unsigned' | 'unknown';

export interface DigitalSignatureInfo {
  filePath: string;
  fileName: string;
  status: DigitalSignatureStatus;
  signerName?: string;
  issuerName?: string;
  trustChainResult?: string;
  validationError?: string;
  limitationsNotice: string;
}

export interface DefenderStatus {
  isAvailable: boolean;
  realTimeProtection: 'enabled' | 'disabled' | 'unknown' | 'no_permissions';
  signaturesStatus: 'up_to_date' | 'outdated' | 'unknown';
  signaturesLastUpdated: string;
  queryResult: 'success' | 'no_permissions' | 'not_available' | 'error';
  limitationsNotice: string;
}

export interface DefenderScanResult {
  filePath: string;
  requested: boolean;
  scanStatus: 'requested' | 'completed' | 'failed' | 'not_supported';
  message: string;
}

export interface MaintenanceOperation {
  id: 'sfc_scannow' | 'dism_checkhealth' | 'dism_scanhealth' | 'dism_restorehealth';
  name: string;
  description: string;
  objective: string;
  requirements: string;
  requiresAdmin: boolean;
  estimatedDuration: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  output?: string;
  error?: string;
}

export interface TempItemCandidate {
  id: string;
  path: string;
  name: string;
  category: 'user_temp' | 'system_temp' | 'browser_cache' | 'windows_logs';
  sizeBytes: number;
  fileCount: number;
  isSafeToClean: boolean;
}

export interface TempScanPreview {
  candidates: TempItemCandidate[];
  totalSizeBytes: number;
  totalFiles: number;
  scannedLocations: string[];
  omittedLockedFilesCount: number;
  scanDate: string;
}

export interface TempCleanResult {
  success: boolean;
  bytesFreed: number;
  filesDeleted: number;
  filesSkipped: number;
  skippedDetails: string[];
  executionDate: string;
}
