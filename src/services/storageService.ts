import { UserSettings, RecentItem } from '../types';

const FAVORITES_KEY = 'techkit_favorites';
const RECENT_KEY = 'techkit_recent';
const SETTINGS_KEY = 'techkit_settings';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  compactMode: false,
  showPendingTools: true,
};

function safeGetJSON<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    const parsed = JSON.parse(data);
    return parsed ?? defaultValue;
  } catch (error) {
    console.error(`Error reading key ${key} from localStorage, resetting:`, error);
    return defaultValue;
  }
}

function safeSetJSON<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing key ${key} to localStorage:`, error);
    return false;
  }
}

export const storageService = {
  // Favorites
  getFavorites(): string[] {
    const favs = safeGetJSON<unknown>(FAVORITES_KEY, []);
    if (Array.isArray(favs)) {
      return favs.filter((item): item is string => typeof item === 'string');
    }
    return [];
  },

  isFavorite(toolId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.includes(toolId);
  },

  toggleFavorite(toolId: string): boolean {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(toolId);
    let newFavorites: string[];
    let isFavNow = false;

    if (index >= 0) {
      newFavorites = favorites.filter((id) => id !== toolId);
    } else {
      newFavorites = [...favorites, toolId];
      isFavNow = true;
    }

    safeSetJSON(FAVORITES_KEY, newFavorites);
    return isFavNow;
  },

  addFavorite(toolId: string): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(toolId)) {
      safeSetJSON(FAVORITES_KEY, [...favorites, toolId]);
    }
  },

  removeFavorite(toolId: string): void {
    const favorites = this.getFavorites();
    safeSetJSON(
      FAVORITES_KEY,
      favorites.filter((id) => id !== toolId)
    );
  },

  // Recent Items
  getRecent(): RecentItem[] {
    const recent = safeGetJSON<unknown>(RECENT_KEY, []);
    if (Array.isArray(recent)) {
      return recent.filter(
        (item): item is RecentItem =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as RecentItem).toolId === 'string' &&
          typeof (item as RecentItem).timestamp === 'number'
      );
    }
    return [];
  },

  addRecent(toolId: string): void {
    const currentRecent = this.getRecent();
    const filtered = currentRecent.filter((item) => item.toolId !== toolId);
    const updated: RecentItem[] = [
      { toolId, timestamp: Date.now() },
      ...filtered,
    ].slice(0, 30); // limit to 30 items
    safeSetJSON(RECENT_KEY, updated);
  },

  removeRecent(toolId: string): void {
    const currentRecent = this.getRecent();
    const updated = currentRecent.filter((item) => item.toolId !== toolId);
    safeSetJSON(RECENT_KEY, updated);
  },

  clearRecent(): void {
    safeSetJSON(RECENT_KEY, []);
  },

  // User Settings
  getSettings(): UserSettings {
    const settings = safeGetJSON<Partial<UserSettings>>(SETTINGS_KEY, DEFAULT_SETTINGS);
    return {
      theme: settings?.theme === 'light' ? 'light' : 'dark',
      compactMode: Boolean(settings?.compactMode),
      showPendingTools: settings?.showPendingTools ?? true,
    };
  },

  saveSettings(settings: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated: UserSettings = {
      ...current,
      ...settings,
    };
    safeSetJSON(SETTINGS_KEY, updated);
    return updated;
  },

  resetSettings(): UserSettings {
    safeSetJSON(SETTINGS_KEY, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  },

  // Clear all local data
  clearAllData(): void {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      localStorage.removeItem(RECENT_KEY);
      localStorage.removeItem(SETTINGS_KEY);
    } catch (e) {
      console.error('Failed clearing localStorage:', e);
    }
  },
};
