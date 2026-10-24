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

  it('retrieves tools via O(1) Map lookup accurately', () => {
    const allTools = catalogService.getAllTools();
    for (const tool of allTools) {
      const retrieved = catalogService.getToolById(tool.id);
      expect(retrieved).toBe(tool);
    }
    expect(catalogService.getToolById('non-existent-tool-id')).toBeUndefined();
  });
});
