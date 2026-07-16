

interface InicioScreenProps {
  onSignInGoogle: () => void;
  onEnterGuest: () => void;
  isLoading?: boolean;
}

export default function InicioScreen({ onSignInGoogle, onEnterGuest, isLoading }: InicioScreenProps) {
  return (
    <div className="concert-hall-bg min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-overlay -z-10" />
      <main className="w-full max-w-[520px] mx-auto z-10 relative">
        <div className="clay-card p-8 md:p-12 flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <div className="clay-icon-raised w-24 h-24 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary-container"
              style={{ fontSize: 48, fontVariationSettings: "'FILL' 0" }}
            >
              school
            </span>
          </div>

          {/* Title + Tagline */}
          <div className="space-y-3">
            <h1 className="font-display-lg text-display-lg text-primary leading-tight">
              Clavis
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Donde cada nota cuenta
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-4">
            <button
              onClick={onSignInGoogle}
              disabled={isLoading}
              className="clay-button-primary w-full py-4 px-6 rounded-2xl font-title-md text-title-md flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isLoading ? 'Conectando...' : 'Continuar con Google'}
            </button>

            <button
              onClick={onEnterGuest}
              disabled={isLoading}
              className="clay-button-secondary w-full py-4 px-6 rounded-2xl font-title-md text-title-md flex items-center justify-center gap-3"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, fontVariationSettings: "'FILL' 0" }}
              >
                person_off
              </span>
              Entrar como Invitado
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-6 opacity-60">
          Clavis Academy of Musical Excellence
        </p>
      </main>
    </div>
  );
}
