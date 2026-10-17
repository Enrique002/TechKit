import { describe, it, expect } from 'vitest';
import { maintenanceService } from '../src/services/maintenanceService';

describe('maintenanceService (Phase 4 Unit Tests)', () => {
  it('returns available maintenance operations', () => {
    const ops = maintenanceService.getOperations();
    expect(ops.length).toBeGreaterThanOrEqual(4);
    expect(ops.some((o) => o.id === 'sfc_scannow')).toBe(true);
    expect(ops.some((o) => o.id === 'dism_restorehealth')).toBe(true);
  });

  it('runs SFC operation and returns output', async () => {
    const result = await maintenanceService.runOperation('sfc_scannow');
    expect(result.success).toBe(true);
    expect(result.output).toContain('Protección de recursos de Windows');
  });

  it('runs DISM operation and returns output', async () => {
    const result = await maintenanceService.runOperation('dism_checkhealth');
    expect(result.success).toBe(true);
    expect(result.output).toContain('DISM');
  });

  it('scans temp file candidates and returns preview data', async () => {
    const preview = await maintenanceService.scanTempFiles();
    expect(preview.candidates.length).toBeGreaterThan(0);
    expect(preview.totalSizeBytes).toBeGreaterThan(0);
    expect(preview.scannedLocations).toContain('%USERPROFILE%\\AppData\\Local\\Temp');
  });

  it('executes temp file cleaning and returns freed byte metrics', async () => {
    const result = await maintenanceService.cleanTempFiles(['user_temp', 'system_temp']);
    expect(result.success).toBe(true);
    expect(result.bytesFreed).toBeGreaterThan(0);
    expect(result.filesDeleted).toBeGreaterThan(0);
  });
});
