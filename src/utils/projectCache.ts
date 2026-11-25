import { ProjectWorkFile } from '@/types/editor';

const DB_NAME = 'dezigner_studio_cache';
const STORE_NAME = 'projects';
const CACHE_KEY = 'active_project';
const LS_FALLBACK_KEY = 'dezigner_active_project_v1';

function openCacheDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProjectToCache(workFile: ProjectWorkFile): Promise<void> {
  try {
    const db = await openCacheDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(workFile, CACHE_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch {
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(workFile));
    }
  }
}

export async function loadProjectFromCache(): Promise<ProjectWorkFile | null> {
  try {
    const db = await openCacheDB();
    const result = await new Promise<ProjectWorkFile | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(CACHE_KEY);
      req.onsuccess = () => resolve((req.result as ProjectWorkFile) || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (result) return result;
  } catch {
    // Fallback to localStorage
  }

  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(LS_FALLBACK_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as ProjectWorkFile;
      } catch {
        return null;
      }
    }
  }
  return null;
}
