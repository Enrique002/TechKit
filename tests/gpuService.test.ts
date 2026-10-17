import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { systemService } from '../src/services/systemService';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe('GPU & Motherboard Detection Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches GPU info in web fallback mode when not in Tauri environment', async () => {
    delete (window as any).__TAURI_INTERNALS__;
    const gpu = await systemService.getGpuInfo();
    expect(gpu.model).toBeDefined();
    expect(gpu.vendor).toBeDefined();
    expect(gpu.dedicatedMemoryBytes).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(gpu.displaysConnected)).toBe(true);
  });

  it('fetches Motherboard info in web fallback mode when not in Tauri environment', async () => {
    delete (window as any).__TAURI_INTERNALS__;
    const mb = await systemService.getMotherboardInfo();
    expect(mb.manufacturer).toBeDefined();
    expect(mb.model).toBeDefined();
    expect(mb.biosVendor).toBeDefined();
    expect(mb.biosVersion).toBeDefined();
  });

  it('correctly maps dedicated NVIDIA RTX 5080 GPU from Tauri invoke response', async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    vi.mocked(invoke).mockResolvedValueOnce({
      model: 'NVIDIA GeForce RTX 5080',
      vendor: 'NVIDIA Corporation',
      dedicated_memory_bytes: 17179869184, // 16 GB
      shared_memory_bytes: 17179869184,
      usage_percentage: 12.5,
      temperature_c: 42,
      power_draw_watts: 85,
      driver_version: '572.16 (WHQL)',
      displays_connected: ['DisplayPort 1: 3840x2160 @ 144Hz (Primary)'],
      available_note: 'Adaptador gráfico dedicado detectado vía Win32_VideoController.',
    });

    const gpu = await systemService.getGpuInfo();

    expect(gpu.model).toBe('NVIDIA GeForce RTX 5080');
    expect(gpu.vendor).toBe('NVIDIA Corporation');
    expect(gpu.dedicatedMemoryBytes).toBe(17179869184);
    expect(gpu.driverVersion).toBe('572.16 (WHQL)');
    expect(gpu.displaysConnected).toContain('DisplayPort 1: 3840x2160 @ 144Hz (Primary)');

    delete (window as any).__TAURI_INTERNALS__;
  });

  it('correctly handles AMD discrete GPU from Tauri invoke', async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    vi.mocked(invoke).mockResolvedValueOnce({
      model: 'AMD Radeon RX 7900 XTX',
      vendor: 'Advanced Micro Devices, Inc.',
      dedicated_memory_bytes: 25769803776, // 24 GB
      shared_memory_bytes: 17179869184,
      usage_percentage: 5.0,
      driver_version: '24.3.1',
      displays_connected: ['Display 1'],
      available_note: 'Adaptador gráfico detectado.',
    });

    const gpu = await systemService.getGpuInfo();
    expect(gpu.model).toBe('AMD Radeon RX 7900 XTX');
    expect(gpu.vendor).toBe('Advanced Micro Devices, Inc.');
    expect(gpu.dedicatedMemoryBytes).toBe(25769803776);

    delete (window as any).__TAURI_INTERNALS__;
  });

  it('handles multi-adapter setup (Intel integrated + NVIDIA dedicated)', async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    vi.mocked(invoke).mockResolvedValueOnce({
      model: 'NVIDIA GeForce RTX 5080',
      vendor: 'NVIDIA Corporation',
      dedicated_memory_bytes: 17179869184,
      driver_version: '572.16',
      displays_connected: ['Display 1'],
      available_note: 'Detectados 2 adaptadores gráficos en el sistema.',
    });

    const gpu = await systemService.getGpuInfo();
    expect(gpu.model).toBe('NVIDIA GeForce RTX 5080');
    expect(gpu.availableNote).toContain('2 adaptadores');

    delete (window as any).__TAURI_INTERNALS__;
  });

  it('handles missing or incomplete GPU properties safely without inventing data', async () => {
    (window as any).__TAURI_INTERNALS__ = {};
    vi.mocked(invoke).mockResolvedValueOnce({
      model: 'Adaptador de pantalla genérico',
      vendor: 'No disponible',
      dedicated_memory_bytes: 0,
      driver_version: 'No disponible',
      displays_connected: [],
      available_note: 'Información parcial obtenida del controlador.',
    });

    const gpu = await systemService.getGpuInfo();
    expect(gpu.model).toBe('Adaptador de pantalla genérico');
    expect(gpu.vendor).toBe('No disponible');
    expect(gpu.dedicatedMemoryBytes).toBe(0);

    delete (window as any).__TAURI_INTERNALS__;
  });
});
