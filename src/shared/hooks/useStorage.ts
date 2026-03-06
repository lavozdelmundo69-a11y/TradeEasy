// Hook reutilizable para persistencia con AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants';

export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(key).then(value => {
      if (value) {
        try {
          setStoredValue(JSON.parse(value) as T);
        } catch {
          setStoredValue(value as unknown as T);
        }
      }
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      const valueToStore = typeof newValue === 'object' ? JSON.stringify(newValue) : newValue;
      AsyncStorage.setItem(key, String(valueToStore)).catch(console.error);
      return newValue;
    });
  }, [key]);

  return [storedValue, setValue, isLoaded] as const;
}
