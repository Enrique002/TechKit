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

  it('returns valid GPU information with RTX model and VRAM details', async () => {
    const gpu = await systemService.getGpuInfo();
    expect(gpu.model).toContain('RTX 5080');
    expect(gpu.vendor).toBe('NVIDIA Corporation');
    expect(gpu.dedicatedMemoryBytes).toBeGreaterThan(0);
    expect(gpu.displaysConnected.length).toBeGreaterThan(0);
  });

  it('returns motherboard and BIOS information', async () => {
    const mb = await systemService.getMotherboardInfo();
    expect(mb.manufacturer).toBeDefined();
    expect(mb.model).toBeDefined();
    expect(mb.biosVersion).toBeDefined();
  });
});
