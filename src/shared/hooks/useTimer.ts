// Hook para temporizador (útil para quizzes cronometrados)
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  isExpired: boolean;
  progress: number; // 0-1
  start: () => void;
  pause: () => void;
  reset: () => void;
  addTime: (seconds: number) => void;
}

export function useTimer(initialSeconds: number, onComplete?: () => void): UseTimerReturn {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  const addTime = useCallback((addSeconds: number) => {
    setSeconds(prev => prev + addSeconds);
  }, []);

  useEffect(() => {
    if (!isRunning || seconds <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (seconds === 0 && isRunning) {
        onCompleteRef.current?.();
        setIsRunning(false);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, seconds]);

  return {
    seconds,
    isRunning,
    isExpired: seconds === 0,
    progress: seconds / initialSeconds,
    start,
    pause,
    reset,
    addTime,
  };
}

// Hook para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Hook paraThrottle
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));
      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

// Hook para prefers dark mode (futuro)
export function useColorScheme() {
  // Por ahora siempre light
  return 'light';
}
