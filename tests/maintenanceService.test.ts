import { describe, it, expect } from 'vitest';
import { maintenanceService } from '../src/services/maintenanceService';

describe('maintenanceService', () => {
  it('gets temp cleaner categories', async () => {
    const categories = await maintenanceService.getTempCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('cleans selected categories', async () => {
    const res = await maintenanceService.cleanSelectedCategories(['user_temp']);
    expect(res.cleanedBytes).toBeGreaterThan(0);
    expect(res.itemsRemoved).toBeGreaterThan(0);
  });
});
