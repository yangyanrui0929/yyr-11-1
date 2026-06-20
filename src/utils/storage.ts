export const storage = {
  save<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (e) {
      console.error('[STORAGE] Save failed:', e);
    }
  },

  load<T>(key: string, fallback: T): T {
    try {
      const serialized = localStorage.getItem(key);
      if (serialized === null) return fallback;
      return JSON.parse(serialized) as T;
    } catch (e) {
      console.error('[STORAGE] Load failed:', e);
      return fallback;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('[STORAGE] Remove failed:', e);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('[STORAGE] Clear failed:', e);
    }
  },

  exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  },
};

export const STORAGE_KEYS = {
  TASKS: 'ruins_decoder_tasks',
  APP_STATE: 'ruins_decoder_app_state',
  DICTIONARY: 'ruins_decoder_dictionary',
} as const;
