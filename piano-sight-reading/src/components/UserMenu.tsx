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
      <div className="w-8 h-8 rounded-full bg-neon-blue/10 animate-pulse" aria-hidden="true" />
    )
  }

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        className="w-8 h-8 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue/50 hover:text-neon-cyan hover:border-neon-blue/40 transition-all cursor-pointer"
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
          className={`w-8 h-8 rounded-full overflow-hidden border-2 border-neon-blue/30 hover:border-neon-cyan transition-all cursor-pointer ${glow ? 'animate-avatar-glow' : ''}`}
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
            <span className="w-full h-full flex items-center justify-center text-xs font-bold text-neon-cyan bg-neon-blue/20">
              {getInitials(user.displayName)}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-[var(--stage-surface)] border border-neon-blue/20 rounded-xl p-1.5 animate-slide-up z-50"
          sideOffset={8}
          align="end"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <div className="px-2.5 py-1.5 mb-1">
            <div className="text-sm font-semibold text-neon-cyan truncate">{user.displayName ?? 'Usuario'}</div>
            <div className="text-xs text-neon-blue/50 truncate">{user.email}</div>
          </div>

          <DropdownMenu.Separator className="h-px bg-neon-blue/15 my-1" />

          <DropdownMenu.Item className="px-2.5 py-1.5 text-xs text-neon-blue/60 outline-none flex items-center gap-2" disabled>
            <span className={`w-2 h-2 rounded-full ${
              syncState.syncError ? 'bg-amber-400' : syncState.lastSyncTime ? 'bg-emerald-400' : 'bg-neon-blue/30'
            }`} />
            {syncState.syncError
              ? 'Reintentando...'
              : syncState.lastSyncTime
                ? 'Sincronizado'
                : 'Sin sincronizar'}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-neon-blue/15 my-1" />

          {!confirmLogout ? (
            <DropdownMenu.Item
              className="px-2.5 py-1.5 text-sm text-neon-blue/70 hover:text-neon-cyan hover:bg-neon-blue/10 rounded-lg cursor-pointer outline-none transition-colors"
              onSelect={(e) => {
                e.preventDefault()
                setConfirmLogout(true)
              }}
            >
              Cerrar sesión
            </DropdownMenu.Item>
          ) : (
            <div className="px-2.5 py-1.5">
              <p className="text-xs text-neon-blue/60 mb-1.5">¿Cerrar sesión?</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 px-2 py-1 text-xs rounded-lg border border-neon-blue/20 text-neon-blue/60 hover:text-neon-cyan hover:border-neon-blue/40 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await signOut()
                    setConfirmLogout(false)
                  }}
                  className="flex-1 px-2 py-1 text-xs rounded-lg bg-neon-blue/15 text-neon-cyan border border-neon-blue/30 hover:bg-neon-blue/25 transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          <DropdownMenu.Separator className="h-px bg-neon-blue/15 my-1" />

          <DropdownMenu.Item
            className="px-2.5 py-1.5 text-xs text-pink-400/70 hover:text-pink-300 hover:bg-pink-500/10 rounded-lg cursor-pointer outline-none transition-colors"
            onSelect={() => onDeleteAccount()}
          >
            Eliminar mis datos
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
