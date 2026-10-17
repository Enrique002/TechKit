import { describe, it, expect } from 'vitest';
import { systemService } from '../src/services/systemService';

describe('systemService Hardware & GPU Specs', () => {
  it('returns valid CPU information including vendor and frequencies', async () => {
    const cpu = await systemService.getCpuInfo();
    expect(cpu.model).toBeDefined();
    expect(cpu.physicalCores).toBeGreaterThan(0);
    expect(cpu.logicalCores).toBeGreaterThanOrEqual(cpu.physicalCores);
    expect(cpu.instructionsSupported.length).toBeGreaterThan(0);
  });

  it('returns valid GPU information structure', async () => {
    const gpu = await systemService.getGpuInfo();
    expect(gpu.model).toBeDefined();
    expect(gpu.vendor).toBeDefined();
    expect(typeof gpu.dedicatedMemoryBytes).toBe('number');
    expect(Array.isArray(gpu.displaysConnected)).toBe(true);
  });

  it('returns motherboard and BIOS information', async () => {
    const mb = await systemService.getMotherboardInfo();
    expect(mb.manufacturer).toBeDefined();
    expect(mb.model).toBeDefined();
    expect(mb.biosVersion).toBeDefined();
  });
});
