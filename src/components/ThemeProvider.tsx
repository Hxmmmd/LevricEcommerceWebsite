'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'dark' | 'light';

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const transitionInProgress = useRef(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('levric-theme');
    const nextTheme: Theme = savedTheme === 'light' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('light', nextTheme === 'light');
  }, []);

  const toggleTheme = () => {
    if (transitionInProgress.current) return;

    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      const applyTheme = () => {
        document.documentElement.classList.toggle('light', nextTheme === 'light');
        window.localStorage.setItem('levric-theme', nextTheme);
      };

      const viewTransitionDocument = document as Document & {
        startViewTransition?: (update: () => void) => {
          finished: Promise<void>;
        };
      };

      if (viewTransitionDocument.startViewTransition) {
        transitionInProgress.current = true;
        const transition = viewTransitionDocument.startViewTransition(applyTheme);
        transition.finished.catch(() => undefined).finally(() => {
          transitionInProgress.current = false;
        });
      } else {
        applyTheme();
      }

      return nextTheme;
    });
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      title={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      className="theme-toggle inline-flex size-10 items-center justify-center rounded-full border border-border bg-muted/60 text-foreground shadow-sm transition hover:border-blue-400 hover:bg-accent hover:shadow-md active:scale-95"
    >
      {isLight ? <Moon className="size-[18px]" aria-hidden="true" /> : <Sun className="size-[18px]" aria-hidden="true" />}
      <span className="sr-only">{isLight ? 'Dark' : 'Light'} theme</span>
    </button>
  );
}

export default ThemeProvider;
