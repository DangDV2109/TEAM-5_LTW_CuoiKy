import { useEffect, useState } from "react";

/**
 * Custom hook đồng bộ state React với localStorage an toàn
 */
export default function useLocalStorage(key, initialValue) {
  const readValue = () => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) return JSON.parse(item);
    } catch {
      // ignore parse errors
    }
    return typeof initialValue === "function" ? initialValue() : initialValue;
  };

  const [storedValue, setStoredValue] = useState(readValue);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // ignore storage quota errors
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
