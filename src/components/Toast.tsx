import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'warning' | 'error'
  onDismiss: () => void
}

const typeStyles = {
  success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  warning: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  error: 'bg-pink-500/20 border-pink-500/40 text-pink-300',
}

const typeIcons = {
  success: '✓',
  warning: '⚠',
  error: '✕',
}

export default function Toast({ message, type = 'warning', onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10)
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDismiss])

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl border backdrop-blur-sm text-sm font-medium transition-all duration-300 ${typeStyles[type]} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}
      role="alert"
    >
      <span className="mr-2">{typeIcons[type]}</span>
      {message}
    </div>
  )
}
