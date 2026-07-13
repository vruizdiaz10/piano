interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: (theme: 'light' | 'dark') => void
  className?: string
}

export default function ThemeToggle({ theme, onToggle, className }: ThemeToggleProps) {
  return (
    <button
      onClick={() => onToggle(theme === 'light' ? 'dark' : 'light')}
      className={className ?? "p-2 rounded-xl bg-white/80 dark:bg-gray-700/80 border border-amber-200 dark:border-gray-600 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-gray-600 transition-all cursor-pointer shadow-sm"}
      aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  )
}
