import { describe, it, expect } from 'vitest';
import { formatBytes, formatUptime, safePercentage, systemService } from '../src/services/systemService';

describe('systemService Unit Tests', () => {
  it('formats bytes into readable size strings correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1073741824)).toBe('1 GB');
    expect(formatBytes(5368709120)).toBe('5 GB');
  });

  it('formats uptime seconds into human-readable strings', () => {
    expect(formatUptime(0)).toBe('0m');
    expect(formatUptime(60)).toBe('1m');
    expect(formatUptime(3660)).toBe('1h 1m');
    expect(formatUptime(90000)).toBe('1d 1h 0m');
  });

  it('calculates percentage safely handling 0, NaN or infinite values', () => {
    expect(safePercentage(50, 100)).toBe(50);
    expect(safePercentage(0, 100)).toBe(0);
    expect(safePercentage(50, 0)).toBe(0);
    expect(safePercentage(NaN, 100)).toBe(0);
    expect(safePercentage(50, NaN)).toBe(0);
    expect(safePercentage(150, 100)).toBe(100);
  });

  it('fetches mock or Tauri system summary correctly', async () => {
    const summary = await systemService.getSystemSummary();
    expect(summary.hostname).toBeDefined();
    expect(summary.osName).toBeDefined();
    expect(summary.architecture).toBeDefined();
  });

  it('fetches CPU info correctly', async () => {
    const cpu = await systemService.getCpuInfo();
    expect(cpu.model).toBeDefined();
    expect(cpu.physicalCores).toBeGreaterThan(0);
    expect(cpu.logicalCores).toBeGreaterThan(0);
  });

  it('fetches Memory info correctly', async () => {
    const mem = await systemService.getMemoryInfo();
    expect(mem.totalBytes).toBeGreaterThan(0);
    expect(mem.usagePercentage).toBeGreaterThanOrEqual(0);
  });

  it('fetches Disk volumes correctly', async () => {
    const disks = await systemService.getDiskInfo();
    expect(Array.isArray(disks)).toBe(true);
    expect(disks.length).toBeGreaterThan(0);
    expect(disks[0].mountPoint).toBeDefined();
  });
});
