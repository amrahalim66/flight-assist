import { useState, useEffect, useCallback } from 'react';

// Same contract as the toggle in Header.jsx: the <html data-theme> attribute is
// the source of truth (set before first paint by the inline script in
// index.html), and the choice is persisted to localStorage when possible.
export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light',
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* storage unavailable — theme still applies for this page view */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return [theme, toggle];
}
