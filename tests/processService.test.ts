import { describe, it, expect } from 'vitest';
import { processService } from '../src/services/processService';

describe('processService', () => {
  it('fetches list of active system processes', async () => {
    const processes = await processService.getProcesses();
    expect(Array.isArray(processes)).toBe(true);
    expect(processes.length).toBeGreaterThan(0);
    const first = processes[0];
    expect(first).toHaveProperty('pid');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('cpuPercentage');
    expect(first).toHaveProperty('memoryBytes');
  });

  it('fetches list of Windows services', async () => {
    const services = await processService.getServices();
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThan(0);
    const first = services[0];
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('status');
  });
});
