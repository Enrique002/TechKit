import { describe, it, expect } from 'vitest';
import { processService } from '../src/services/processService';

describe('processService - Fase 3', () => {
  it('obtiene la lista de procesos con propiedades requeridas', async () => {
    const processes = await processService.getProcesses();
    expect(processes.length).toBeGreaterThan(0);

    const first = processes[0];
    expect(first).toHaveProperty('pid');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('cpuUsagePercentage');
    expect(first).toHaveProperty('memoryBytes');
    expect(first).toHaveProperty('exePath');
    expect(first).toHaveProperty('user');
    expect(first).toHaveProperty('status');
    expect(first).toHaveProperty('isCritical');
  });

  it('impide la finalización de un proceso crítico de Windows (PID <= 4 o protegido)', async () => {
    const resPid0 = await processService.killProcess(0);
    expect(resPid0.success).toBe(false);

    const resPid4 = await processService.killProcess(4);
    expect(resPid4.success).toBe(false);
  });

  it('permite solicitar la finalización de un proceso no crítico en entorno de pruebas', async () => {
    const res = await processService.killProcess(1234);
    expect(res.success).toBe(true);
    expect(res.pid).toBe(1234);
  });

  it('impide la finalización del árbol de procesos de un proceso crítico (PID <= 4)', async () => {
    const resPid0 = await processService.killProcessTree(0);
    expect(resPid0.success).toBe(false);

    const resPid4 = await processService.killProcessTree(4);
    expect(resPid4.success).toBe(false);
  });

  it('permite solicitar la finalización del árbol de un proceso no crítico', async () => {
    const res = await processService.killProcessTree(1234);
    expect(res.success).toBe(true);
    expect(res.pid).toBe(1234);
    expect(res.message).toContain('Árbol de procesos');
  });
});
