import { describe, it, expect } from 'vitest';
import { windowServicesService } from '../src/services/windowServicesService';

describe('windowServicesService - Fase 3', () => {
  it('obtiene la lista de servicios de Windows con sus atributos reales', async () => {
    const services = await windowServicesService.getServices();
    expect(services.length).toBeGreaterThan(0);

    const dnsService = services.find((s) => s.name.toLowerCase() === 'dnscache');
    expect(dnsService).toBeDefined();
    if (dnsService) {
      expect(dnsService.displayName).toBe('Cliente DNS (DNS Cache)');
      expect(dnsService.status).toBe('Running');
      expect(dnsService.isCritical).toBe(true);
    }
  });

  it('bloquea la modificación de servicios críticos protegidos', async () => {
    const res = await windowServicesService.controlService('Dnscache', 'stop');
    expect(res.success).toBe(false);
    expect(res.message).toContain('esencial');
  });

  it('permite solicitar control sobre un servicio no crítico', async () => {
    const res = await windowServicesService.controlService('bits', 'start');
    expect(res.success).toBe(true);
  });
});
