/**
 * Local-only IndexedDB storage client for private lesson study scratchpads.
 * Completely client-side and offline-ready with zero cloud egress.
 */

const DB_NAME = "EcorpLessonNotesDB";
const DB_VERSION = 1;
const STORE_NAME = "notes";

interface NoteRecord {
  lessonId: string;
  note: string;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "lessonId" });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function getLessonNote(lessonId: string): Promise<string> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(lessonId);

      request.onsuccess = () => {
        const record = request.result as NoteRecord | undefined;
        resolve(record ? record.note : "");
      };

      request.onerror = () => {
        resolve("");
      };
    });
  } catch (err) {
    console.warn("Failed to read from IndexedDB, fallback to empty", err);
    return "";
  }
}

export async function saveLessonNote(lessonId: string, note: string): Promise<number> {
  try {
    const db = await openDB();
    const now = Date.now();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const record: NoteRecord = {
        lessonId,
        note,
        updatedAt: now,
      };

      const request = store.put(record);

      request.onsuccess = () => {
        resolve(now);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn("Failed to write note to IndexedDB", err);
    throw err;
  }
}

export async function deleteLessonNote(lessonId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(lessonId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn("Failed to delete note from IndexedDB", err);
  }
}
