import { describe, it, expect } from 'vitest';
import { networkService } from '../src/services/networkService';

describe('networkService', () => {
  it('fetches active network interfaces', async () => {
    const interfaces = await networkService.getNetworkInterfaces();
    expect(Array.isArray(interfaces)).toBe(true);
    expect(interfaces.length).toBeGreaterThan(0);
    expect(interfaces[0]).toHaveProperty('name');
    expect(interfaces[0]).toHaveProperty('ipAddress');
  });

  it('runs ping host test and returns response with latency', async () => {
    const res = await networkService.pingHost('8.8.8.8');
    expect(res.host).toBe('8.8.8.8');
    expect(res.latencyMs).toBeGreaterThan(0);
    expect(res.status).toBe('Exitoso');
  });
});
