import { useState, useEffect } from 'react'

interface CalibrationToastProps {
  isVisible: boolean
  onCalibrate: () => void
  onDismiss: () => void
}

const DISMISS_KEY = 'calibrationToastDismissed'
const AUTO_DISMISS_MS = 8000

export function CalibrationToast({ isVisible, onCalibrate, onDismiss }: CalibrationToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Check if already dismissed this session
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed) {
        onDismiss()
        return
      }
      // Fade in
      const t = setTimeout(() => setShow(true), 10)
      return () => clearTimeout(t)
    } else {
      setShow(false)
    }
  }, [isVisible])

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => {
      handleDismiss()
    }, AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [show])

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setTimeout(() => onDismiss(), 300) // Wait for fade-out
  }

  const handleCalibrate = () => {
    setShow(false)
    setTimeout(() => onCalibrate(), 300)
  }

  if (!isVisible) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-300
        ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}
    >
      <div className="clay-card px-4 py-3 flex items-center gap-3 min-w-[320px] max-w-[420px]">
        <span className="material-symbols-outlined text-lg text-primary">
          settings_input_hdmi
        </span>
        <p className="text-sm font-body text-clay-text flex-1">
          Controlador MIDI detectado — calibrá para mejor precisión
        </p>
        <button
          onClick={handleCalibrate}
          className="clay-btn-primary px-3 py-1 text-xs font-label"
        >
          Calibrar
        </button>
        <button
          onClick={handleDismiss}
          className="text-xs text-outline hover:text-clay-text transition-colors px-1"
          aria-label="Cerrar"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
