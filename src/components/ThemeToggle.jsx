import { Sun, Moon } from 'lucide-react'

/**
 * ThemeToggle — a single, quiet icon button that flips light ⇆ dark.
 * Colour comes from theme tokens so it reads correctly in either mode.
 */
export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const isDark = theme !== 'light'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted transition-all duration-200 hover:border-white/20 hover:text-fg ${className}`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
