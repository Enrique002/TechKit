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

  it('caches getAllTools() array instance across multiple calls', () => {
    const toolsFirstCall = catalogService.getAllTools();
    const toolsSecondCall = catalogService.getAllTools();

    expect(toolsFirstCall).toBe(toolsSecondCall);
    expect(toolsFirstCall.length).toBeGreaterThan(0);
  });

  it('provides O(1) cached category and external tool arrays with referential stability', () => {
    // getToolsByCategory
    const hwFirst = catalogService.getToolsByCategory('hardware');
    const hwSecond = catalogService.getToolsByCategory('hardware');
    expect(hwFirst).toBe(hwSecond);
    expect(hwFirst.length).toBeGreaterThan(0);

    // getExternalTools
    const extFirst = catalogService.getExternalTools();
    const extSecond = catalogService.getExternalTools();
    expect(extFirst).toBe(extSecond);
    expect(extFirst.length).toBeGreaterThan(0);

    // getExternalToolsByCategory
    const extNetFirst = catalogService.getExternalToolsByCategory('network');
    const extNetSecond = catalogService.getExternalToolsByCategory('network');
    expect(extNetFirst).toBe(extNetSecond);

    // getToolById O(1) map lookup
    const tool = catalogService.getToolById('hw-cpu-info');
    expect(tool?.name).toBe('Información del Procesador (CPU)');

    const nonExistent = catalogService.getToolById('non-existent-tool-id');
    expect(nonExistent).toBeUndefined();

    // getCategoryById O(1) map lookup
    const cat = catalogService.getCategoryById('hardware');
    expect(cat?.name).toBe('Sistema y Hardware');

    const nonExistentCat = catalogService.getCategoryById('unknown-cat' as any);
    expect(nonExistentCat).toBeUndefined();
  });
});
