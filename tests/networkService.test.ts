import { describe, it, expect } from 'vitest';
import { networkService } from '../src/services/networkService';

describe('networkService - Fase 3', () => {
  it('obtiene adaptadores e interfaces de red', async () => {
    const interfaces = await networkService.getNetworkInterfaces();
    expect(interfaces.length).toBeGreaterThan(0);

    const eth = interfaces.find((i) => i.name === 'Ethernet');
    expect(eth).toBeDefined();
    if (eth) {
      expect(eth.ipv4Addresses).toContain('192.168.1.105');
      expect(eth.status).toBe('connected');
    }
  });

  it('valida la prueba de Ping rechazando caracteres no permitidos e inyección', async () => {
    const invalidRes = await networkService.pingHost('8.8.8.8; ls');
    expect(invalidRes.success).toBe(false);
    expect(invalidRes.error).toContain('seguridad');

    const validRes = await networkService.pingHost('1.1.1.1');
    expect(validRes.success).toBe(true);
    expect(validRes.avgRttMs).toBeDefined();
  });

  it('realiza resolución DNS para dominios válidos e identifica errores', async () => {
    const resSuccess = await networkService.dnsLookup('google.com');
    expect(resSuccess.status).toBe('success');
    expect(resSuccess.addresses.length).toBeGreaterThan(0);

    const resFail = await networkService.dnsLookup('invalid-notfound-domain-999.test');
    expect(resFail.status).toBe('no_records');
  });

  it('obtiene las conexiones activas y mapea adecuadamente el PID', async () => {
    const connections = await networkService.getActiveConnections();
    expect(connections.length).toBeGreaterThan(0);

    const connWithPid = connections.find((c) => c.pid === 1234);
    expect(connWithPid).toBeDefined();
    if (connWithPid) {
      expect(connWithPid.processName).toBe('msedge.exe');
      expect(connWithPid.remotePort).toBe(443);
    }
  });
});
