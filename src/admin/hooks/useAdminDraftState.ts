import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

type InitialValue<T> = T | (() => T);

function resolveInitial<T>(initialValue: InitialValue<T>): T {
  return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
}

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readStoredValue<T>(key: string): { found: boolean; value?: T } {
  const storage = getSessionStorage();
  if (!storage) return { found: false };

  const raw = storage.getItem(key);
  if (raw === null) return { found: false };

  try {
    return { found: true, value: JSON.parse(raw) as T };
  } catch {
    storage.removeItem(key);
    return { found: false };
  }
}

/**
 * Keeps an in-progress Admin form in the current browser tab. The draft is
 * restored synchronously on mount and is only written after the caller marks
 * the form as dirty. sessionStorage avoids putting private Admin input in a
 * long-lived shared browser profile.
 */
export function useAdminDraftState<T>(
  key: string,
  initialValue: InitialValue<T>,
): {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  restored: boolean;
  setPersist: (persist: boolean) => void;
  clear: () => void;
} {
  const [stored] = useState(() => readStoredValue<T>(key));
  const [value, setValue] = useState<T>(() =>
    stored.found && stored.value !== undefined ? stored.value : resolveInitial(initialValue),
  );
  const [persist, setPersist] = useState(stored.found);

  useEffect(() => {
    const storage = getSessionStorage();
    if (!storage) return;

    if (!persist) {
      storage.removeItem(key);
      return;
    }

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be disabled or full. The in-memory form remains usable.
    }
  }, [key, persist, value]);

  const clear = useCallback(() => {
    getSessionStorage()?.removeItem(key);
    setPersist(false);
  }, [key]);

  const updatePersist = useCallback((next: boolean) => setPersist(next), []);

  return {
    value,
    setValue,
    restored: stored.found,
    setPersist: updatePersist,
    clear,
  };
}
