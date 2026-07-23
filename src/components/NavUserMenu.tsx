import { useEffect, useRef, useState } from 'react'

interface NavUserMenuProps {
  userName: string
  userLevel?: number
  userAvatar?: string
  onProfile: () => void
  onLogout?: () => void
  onDeleteAccount?: () => void
}

export default function NavUserMenu({
  userName,
  userLevel = 1,
  userAvatar,
  onProfile,
  onLogout,
  onDeleteAccount,
}: NavUserMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative pl-4 border-l border-outline-variant/50">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menú de ${userName}`}
        className="flex items-center gap-2 group"
      >
        <div className="text-right hidden sm:block">
          <p className="font-label-caps text-label-caps text-outline uppercase tracking-widest text-[10px]">
            Nivel {userLevel}
          </p>
          <p className="font-title-md text-title-md text-primary group-hover:text-velvet-red transition-colors">
            {userName}
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-surface-variant overflow-hidden border-2 border-brass-highlight shadow-sm">
          {userAvatar ? (
            <img src={userAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-title-md text-primary" aria-hidden="true">
              {userName.charAt(0)}
            </div>
          )}
        </div>
        <span
          className={`material-symbols-outlined text-outline text-lg transition-transform hidden sm:inline ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 min-w-[200px] clay-card rounded-xl p-2 z-[60] shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onProfile()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-title-md text-sm text-primary hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">person</span>
            Perfil
          </button>
          <div className="h-px bg-outline-variant/40 my-1.5" role="separator" />
          {onLogout && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-title-md text-sm text-velvet-red hover:bg-error-container/40 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
              Cerrar sesión
            </button>
          )}
          {onDeleteAccount && (
            <>
              <div className="h-px bg-outline-variant/40 my-1.5" role="separator" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
                  onDeleteAccount()
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left font-title-md text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">delete</span>
                Eliminar mis datos
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
