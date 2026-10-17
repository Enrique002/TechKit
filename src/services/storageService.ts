import { UserSettings, RecentItem } from '../types';

const SETTINGS_KEY = 'techkit_user_settings_v1';
const FAVORITES_KEY = 'techkit_favorites_v1';
const RECENT_KEY = 'techkit_recent_v1';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  compactMode: false,
  showPendingTools: true,
  refreshIntervalSec: 3,
};

export const storageService = {
  getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save settings to localStorage:', err);
    }
    return updated;
  },

  getFavorites(): string[] {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  isFavorite(toolId: string): boolean {
    return this.getFavorites().includes(toolId);
  },

  addFavorite(toolId: string): string[] {
    const favorites = this.getFavorites();
    if (!favorites.includes(toolId)) {
      const updated = [...favorites, toolId];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save favorites:', err);
      }
      return updated;
    }
    return favorites;
  },

  removeFavorite(toolId: string): string[] {
    const favorites = this.getFavorites();
    const updated = favorites.filter((id) => id !== toolId);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save favorites:', err);
    }
    return updated;
  },

  toggleFavorite(toolId: string): string[] {
    if (this.isFavorite(toolId)) {
      return this.removeFavorite(toolId);
    } else {
      return this.addFavorite(toolId);
    }
  },

  getRecent(): RecentItem[] {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  addRecent(toolId: string): RecentItem[] {
    const recent = this.getRecent().filter((item) => item.toolId !== toolId);
    const newItem: RecentItem = {
      toolId,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...recent].slice(0, 20); // Keep last 20

    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save recent tools:', err);
    }

    return updated;
  },

  clearRecent(): void {
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch (err) {
      console.warn('Failed to clear recent list:', err);
    }
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(FAVORITES_KEY);
      localStorage.removeItem(RECENT_KEY);
    } catch (err) {
      console.warn('Failed to clear localStorage data:', err);
    }
  },
};
