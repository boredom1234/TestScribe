import React from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Start with initial value for SSR consistency
  const [storedValue, setStoredValue] = React.useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);
        setStoredValue(parsed);
      }
      setIsHydrated(true);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setIsHydrated(true);
    }
  }, [key]);

  // Save to localStorage and update state
  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  return [storedValue, setValue, isHydrated] as const;
}
