import React from 'react';
import { MoonIcon, SunIcon } from './icons';

interface ThemeToggleProps {
  className?: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, theme, toggleTheme }) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`
        relative flex w-14 h-8 p-1 rounded-full cursor-pointer transition-colors duration-300
        bg-card-alt dark:bg-dark-background
        ${className}
      `}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="w-full h-full flex items-center justify-between px-1">
        <SunIcon className="w-4 h-4 text-slate-500" />
        <MoonIcon className="w-4 h-4 text-slate-500" />
      </div>
      <div
        className={`
          absolute top-1 flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300
          bg-white dark:bg-dark-card-alt shadow-sm
          ${isDark ? "transform translate-x-6" : "transform translate-x-0"}
        `}
      >
        {isDark ? (
          <MoonIcon className="w-4 h-4 text-dark-primary-soft-fg" />
        ) : (
          <SunIcon className="w-4 h-4 text-accent-orange" />
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;