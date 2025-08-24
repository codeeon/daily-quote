import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue] as const;
}

export function useSettings() {
  const [fontSize, setFontSize] = useLocalStorage('quote-font-size', 'medium');
  const [darkMode, setDarkMode] = useLocalStorage('quote-dark-mode', false);
  const [favorites, setFavorites] = useLocalStorage<string[]>('quote-favorites', []);

  const toggleFavorite = useCallback((date: string) => {
    setFavorites(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  }, [setFavorites]);

  const isFavorite = useCallback((date: string) => {
    return favorites.includes(date);
  }, [favorites]);

  return {
    fontSize,
    setFontSize,
    darkMode,
    setDarkMode,
    favorites,
    setFavorites,
    toggleFavorite,
    isFavorite,
  };
}