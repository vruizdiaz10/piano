interface ConcertCurtainsProps {
  isOpen?: boolean
}

export default function ConcertCurtains({ isOpen }: ConcertCurtainsProps) {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none" style={{ height: '64px' }}>
        <svg viewBox="0 0 1200 64" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="valance-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--curtain-primary)" />
              <stop offset="100%" stopColor="var(--curtain-fold)" />
            </linearGradient>
          </defs>
          <rect width="1200" height="56" fill="url(#valance-grad)" />
          <path d="M0,56 Q25,44 50,56 Q75,44 100,56 Q125,44 150,56 Q175,44 200,56 Q225,44 250,56 Q275,44 300,56 Q325,44 350,56 Q375,44 400,56 Q425,44 450,56 Q475,44 500,56 Q525,44 550,56 Q575,44 600,56 Q625,44 650,56 Q675,44 700,56 Q725,44 750,56 Q775,44 800,56 Q825,44 850,56 Q875,44 900,56 Q925,44 950,56 Q975,44 1000,56 Q1025,44 1050,56 Q1075,44 1100,56 Q1125,44 1150,56 Q1175,44 1200,56 L1200,64 L0,64 Z" fill="var(--curtain-fold)" />
          <line x1="0" y1="56" x2="1200" y2="56" stroke="var(--gold)" strokeWidth="1.5" />
          <line x1="0" y1="62" x2="1200" y2="62" stroke="var(--gold-dim)" strokeWidth="1" />
        </svg>
      </div>
      <div className={`fixed top-0 left-0 bottom-0 z-40 pointer-events-none ${isOpen ? 'animate-curtain-open-left' : 'animate-curtain-slide'}`} style={{ width: '48px' }}>
        <svg viewBox="0 0 48 800" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="left-curtain" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--curtain-primary)" />
              <stop offset="60%" stopColor="var(--curtain-fold)" />
              <stop offset="100%" stopColor="var(--curtain-primary)" />
            </linearGradient>
          </defs>
          <rect width="48" height="800" fill="url(#left-curtain)" />
          <line x1="16" y1="0" x2="16" y2="800" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          <line x1="32" y1="0" x2="32" y2="800" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <line x1="46" y1="0" x2="46" y2="800" stroke="var(--gold-dim)" strokeWidth="1" />
        </svg>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-[var(--gold)] to-[var(--gold-light)]" />
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] shadow-lg" />
        </div>
      </div>
      <div className={`fixed top-0 right-0 bottom-0 z-40 pointer-events-none ${isOpen ? 'animate-curtain-open-right' : 'animate-curtain-slide-right'}`} style={{ width: '48px' }}>
        <svg viewBox="0 0 48 800" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="right-curtain" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--curtain-primary)" />
              <stop offset="40%" stopColor="var(--curtain-fold)" />
              <stop offset="100%" stopColor="var(--curtain-primary)" />
            </linearGradient>
          </defs>
          <rect width="48" height="800" fill="url(#right-curtain)" />
          <line x1="16" y1="0" x2="16" y2="800" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          <line x1="32" y1="0" x2="32" y2="800" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
          <line x1="1" y1="0" x2="1" y2="800" stroke="var(--gold-dim)" strokeWidth="1" />
        </svg>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-[var(--gold)] to-[var(--gold-light)]" />
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--gold-light)] to-[var(--gold)] shadow-lg" />
        </div>
      </div>
    </>
  )
}
