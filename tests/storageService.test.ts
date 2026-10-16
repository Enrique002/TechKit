import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/services/storageService';

describe('storageService Phase 2', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('manages favorites for Phase 2 tools', () => {
    expect(storageService.getFavorites()).toEqual([]);
    storageService.addFavorite('hw-cpu-info');
    expect(storageService.isFavorite('hw-cpu-info')).toBe(true);

    storageService.removeFavorite('hw-cpu-info');
    expect(storageService.isFavorite('hw-cpu-info')).toBe(false);
  });

  it('tracks recent Phase 2 tools', () => {
    storageService.addRecent('sys-summary-info');
    storageService.addRecent('disk-storage-checker');

    const recent = storageService.getRecent();
    expect(recent.length).toBe(2);
    expect(recent[0].toolId).toBe('disk-storage-checker');
  });
});
