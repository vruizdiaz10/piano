import { useState, useEffect, useRef } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import type { SyncState } from '../hooks/useSessionSync'

interface UserMenuProps {
  syncState: SyncState
  onDeleteAccount: () => void
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function UserMenu({ syncState, onDeleteAccount }: UserMenuProps) {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [glow, setGlow] = useState(false)
  const prevUserRef = useRef(user)

  useEffect(() => {
    if (!prevUserRef.current && user) {
      setGlow(true)
      const t = setTimeout(() => setGlow(false), 1000)
      prevUserRef.current = user
      return () => clearTimeout(t)
    }
    prevUserRef.current = user
  }, [user])

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse" aria-hidden="true" />
    )
  }

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary/50 hover:text-primary hover:border-primary/40 transition-all cursor-pointer"
        title="Guardar progreso"
        aria-label="Iniciar sesión para guardar progreso"
      >
        <User className="w-4 h-4" />
      </button>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`w-8 h-8 rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary transition-all cursor-pointer ${glow ? 'animate-avatar-glow' : ''}`}
          aria-label={`Menú de usuario: ${user.displayName ?? 'Usuario'}`}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.parentElement!.textContent = getInitials(user.displayName)
              }}
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-xs font-bold text-primary bg-primary/20">
              {getInitials(user.displayName)}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-popover border border-border rounded-xl p-1.5 animate-slide-up z-50 shadow-lg"
          sideOffset={8}
          align="end"
        >
          <div className="px-2.5 py-1.5 mb-1">
            <div className="text-sm font-semibold text-foreground truncate">{user.displayName ?? 'Usuario'}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          <DropdownMenu.Item className="px-2.5 py-1.5 text-xs text-muted-foreground outline-none flex items-center gap-2" disabled>
            <span className={`w-2 h-2 rounded-full ${
              syncState.syncError ? 'bg-amber-400' : syncState.lastSyncTime ? 'bg-emerald-400' : 'bg-muted-foreground/30'
            }`} />
            {syncState.syncError
              ? 'Reintentando...'
              : syncState.lastSyncTime
                ? 'Sincronizado'
                : 'Sin sincronizar'}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          {!confirmLogout ? (
            <DropdownMenu.Item
              className="px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg cursor-pointer outline-none transition-colors"
              onSelect={(e) => {
                e.preventDefault()
                setConfirmLogout(true)
              }}
            >
              Cerrar sesión
            </DropdownMenu.Item>
          ) : (
            <div className="px-2.5 py-1.5">
              <p className="text-xs text-muted-foreground mb-1.5">¿Cerrar sesión?</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 px-2 py-1 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await signOut()
                    setConfirmLogout(false)
                  }}
                  className="flex-1 px-2 py-1 text-xs rounded-lg bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          <DropdownMenu.Separator className="h-px bg-border my-1" />

          <DropdownMenu.Item
            className="px-2.5 py-1.5 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer outline-none transition-colors"
            onSelect={() => onDeleteAccount()}
          >
            Eliminar mis datos
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
