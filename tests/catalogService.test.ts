import { describe, it, expect } from 'vitest';
import { catalogService } from '../src/services/catalogService';

describe('catalogService Phase 2', () => {
  it('includes Phase 2 functional tools in catalog', () => {
    const summaryTool = catalogService.getToolById('sys-summary-info');
    expect(summaryTool).toBeDefined();
    expect(summaryTool?.status).toBe('available');

    const cpuTool = catalogService.getToolById('hw-cpu-info');
    expect(cpuTool?.status).toBe('available');

    const ramTool = catalogService.getToolById('hw-ram-info');
    expect(ramTool?.status).toBe('available');

    const storageTool = catalogService.getToolById('disk-storage-checker');
    expect(storageTool?.status).toBe('available');
  });

  it('searches Phase 2 keywords like "procesador", "almacenamiento", "RAM"', () => {
    const cpuResults = catalogService.searchTools({ query: 'procesador' });
    expect(cpuResults.some((t) => t.id === 'hw-cpu-info')).toBe(true);

    const ramResults = catalogService.searchTools({ query: 'RAM' });
    expect(ramResults.some((t) => t.id === 'hw-ram-info')).toBe(true);

    const storageResults = catalogService.searchTools({ query: 'almacenamiento' });
    expect(storageResults.some((t) => t.id === 'disk-storage-checker')).toBe(true);
  });

  it('uses memoized cached array references and O(1) map lookups', () => {
    const allToolsFirst = catalogService.getAllTools();
    const allToolsSecond = catalogService.getAllTools();

    // Verify same array reference is returned (memoized cache)
    expect(allToolsFirst).toBe(allToolsSecond);

    const extToolsFirst = catalogService.getExternalTools();
    const extToolsSecond = catalogService.getExternalTools();
    expect(extToolsFirst).toBe(extToolsSecond);

    const hardwareTools = catalogService.getToolsByCategory('hardware');
    expect(hardwareTools.length).toBeGreaterThan(0);
    expect(hardwareTools.every((t) => t.category === 'hardware')).toBe(true);

    const extHardwareTools = catalogService.getExternalToolsByCategory('hardware');
    expect(extHardwareTools.length).toBeGreaterThan(0);
    expect(extHardwareTools.every((t) => t.category === 'hardware' && t.type === 'external_app')).toBe(true);
  });
});
