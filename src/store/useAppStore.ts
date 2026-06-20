import { create } from 'zustand';
import type { CipherTask, AppSettings, DictionaryEntry, Marker } from '@/types';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { MOCK_TASKS, MOCK_DICTIONARY } from '@/data/mockTasks';
import { generateId } from '@/utils/cipher';

interface AppState {
  tasks: CipherTask[];
  currentTaskId: string | null;
  settings: AppSettings;
  dictionary: DictionaryEntry[];

  init: () => void;
  setCurrentTask: (id: string | null) => void;
  getCurrentTask: () => CipherTask | null;

  createTask: (data: Partial<CipherTask>) => CipherTask;
  updateTask: (id: string, updates: Partial<CipherTask>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;

  setSubstitution: (taskId: string, cipherChar: string, plainChar: string | null) => void;
  clearSubstitution: (taskId: string) => void;

  addMarker: (taskId: string, marker: Omit<Marker, 'id'>) => void;
  removeMarker: (taskId: string, markerId: string) => void;
  updateMarker: (taskId: string, markerId: string, updates: Partial<Marker>) => void;

  updateNotes: (taskId: string, notes: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;

  exportTasks: () => string;
  importTasks: (json: string) => boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  crtEffect: true,
  soundEnabled: false,
  theme: 'terminal',
};

function persistTasks(tasks: CipherTask[]) {
  storage.save(STORAGE_KEYS.TASKS, tasks);
}

function persistAppState(state: { currentTaskId: string | null; settings: AppSettings }) {
  storage.save(STORAGE_KEYS.APP_STATE, state);
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: [],
  currentTaskId: null,
  settings: DEFAULT_SETTINGS,
  dictionary: MOCK_DICTIONARY,

  init: () => {
    const savedTasks = storage.load<CipherTask[]>(STORAGE_KEYS.TASKS, []);
    const savedAppState = storage.load<{
      currentTaskId: string | null;
      settings: AppSettings;
    }>(STORAGE_KEYS.APP_STATE, { currentTaskId: null, settings: DEFAULT_SETTINGS });

    const savedDict = storage.load<DictionaryEntry[]>(STORAGE_KEYS.DICTIONARY, MOCK_DICTIONARY);

    let tasks = savedTasks;
    if (tasks.length === 0) {
      tasks = MOCK_TASKS;
      persistTasks(tasks);
    }

    const currentTaskId = savedAppState.currentTaskId ?? (tasks[0]?.id || null);

    set({
      tasks,
      currentTaskId,
      settings: { ...DEFAULT_SETTINGS, ...savedAppState.settings },
      dictionary: savedDict,
    });
  },

  setCurrentTask: (id) => {
    set({ currentTaskId: id });
    const state = get();
    persistAppState({ currentTaskId: id, settings: state.settings });
  },

  getCurrentTask: () => {
    const { tasks, currentTaskId } = get();
    return tasks.find((t) => t.id === currentTaskId) || null;
  },

  createTask: (data) => {
    const now = new Date().toISOString();
    const newTask: CipherTask = {
      id: generateId(),
      title: data.title || '未命名任务',
      ciphertext: data.ciphertext || '',
      plaintextAnswer: data.plaintextAnswer || '',
      source: data.source || '未知来源',
      difficulty: data.difficulty || 'medium',
      status: 'in_progress',
      substitutionMap: {},
      markers: [],
      notes: '',
      hint: data.hint || '',
      createdAt: now,
      updatedAt: now,
    };
    const tasks = [...get().tasks, newTask];
    set({ tasks, currentTaskId: newTask.id });
    persistTasks(tasks);
    return newTask;
  },

  updateTask: (id, updates) => {
    const tasks = get().tasks.map((t) =>
      t.id === id
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    );
    set({ tasks });
    persistTasks(tasks);
  },

  deleteTask: (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    const currentTaskId = get().currentTaskId === id ? tasks[0]?.id || null : get().currentTaskId;
    set({ tasks, currentTaskId });
    persistTasks(tasks);
  },

  completeTask: (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    set({ tasks });
    persistTasks(tasks);
  },

  setSubstitution: (taskId, cipherChar, plainChar) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      const newMap = { ...t.substitutionMap };
      if (plainChar === null || plainChar === '') {
        delete newMap[cipherChar];
      } else {
        const upper = plainChar.toUpperCase();
        for (const key of Object.keys(newMap)) {
          if (newMap[key] === upper) {
            delete newMap[key];
          }
        }
        newMap[cipherChar] = upper;
      }
      return { ...t, substitutionMap: newMap, updatedAt: new Date().toISOString() };
    });
    set({ tasks });
    persistTasks(tasks);
  },

  clearSubstitution: (taskId) => {
    const tasks = get().tasks.map((t) =>
      t.id === taskId
        ? { ...t, substitutionMap: {}, updatedAt: new Date().toISOString() }
        : t
    );
    set({ tasks });
    persistTasks(tasks);
  },

  addMarker: (taskId, marker) => {
    const tasks = get().tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            markers: [...t.markers, { ...marker, id: generateId() }],
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    set({ tasks });
    persistTasks(tasks);
  },

  removeMarker: (taskId, markerId) => {
    const tasks = get().tasks.map((t) =>
      t.id === taskId
        ? { ...t, markers: t.markers.filter((m) => m.id !== markerId), updatedAt: new Date().toISOString() }
        : t
    );
    set({ tasks });
    persistTasks(tasks);
  },

  updateMarker: (taskId, markerId, updates) => {
    const tasks = get().tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            markers: t.markers.map((m) => (m.id === markerId ? { ...m, ...updates } : m)),
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    set({ tasks });
    persistTasks(tasks);
  },

  updateNotes: (taskId, notes) => {
    const tasks = get().tasks.map((t) =>
      t.id === taskId ? { ...t, notes, updatedAt: new Date().toISOString() } : t
    );
    set({ tasks });
    persistTasks(tasks);
  },

  updateSettings: (settings) => {
    const newSettings = { ...get().settings, ...settings };
    set({ settings: newSettings });
    persistAppState({ currentTaskId: get().currentTaskId, settings: newSettings });
  },

  exportTasks: () => {
    return JSON.stringify(
      { tasks: get().tasks, exportedAt: new Date().toISOString() },
      null,
      2
    );
  },

  importTasks: (json) => {
    try {
      const data = JSON.parse(json);
      if (!data.tasks || !Array.isArray(data.tasks)) return false;
      const tasks = data.tasks as CipherTask[];
      set({ tasks, currentTaskId: tasks[0]?.id || null });
      persistTasks(tasks);
      return true;
    } catch {
      return false;
    }
  },
}));
