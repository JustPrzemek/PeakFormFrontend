import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Ustaw timer, który zaktualizuje wartość po upływie `delay`
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Wyczyść timer, jeśli wartość się zmieniła (np. użytkownik dalej pisze)
    // To jest sedno debouncingu!
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Uruchom ponownie tylko, gdy zmieni się wartość lub opóźnienie

  return debouncedValue;
}