import NavUserMenu from './NavUserMenu';

interface TopNavBarProps {
  activeScreen: 'dashboard' | 'biblioteca' | 'perfil';
  onNavigate: (target: string) => void;
  onLogout: () => void;
  userName: string;
  userLevel?: number;
  userAvatar?: string;
}

const NAV_LINKS = [
  { key: 'dashboard', label: 'Inicio' },
  { key: 'biblioteca', label: 'Biblioteca' },
];

export default function TopNavBar({
  activeScreen,
  onNavigate,
  onLogout,
  userName,
  userLevel = 1,
  userAvatar,
}: TopNavBarProps) {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-container-padding h-20 bg-sheet-cream/90 backdrop-blur-md shadow-[0_8px_30px_-5px_rgba(61,31,16,0.05)] border-b border-outline-variant/30">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="font-headline-lg text-headline-lg font-bold text-primary hover:text-velvet-red transition-colors"
          aria-label="Ir al inicio"
        >
          Clavis
        </button>
      </div>
      <div className="hidden md:flex gap-8">
        {NAV_LINKS.map((s) => (
          <button
            key={s.key}
            onClick={() => onNavigate(s.key)}
            className={`font-label-caps text-label-caps uppercase tracking-widest transition-colors ${
              s.key === activeScreen
                ? 'text-primary border-b-2 border-primary pb-1 font-bold'
                : 'text-on-surface-variant font-medium hover:text-primary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <NavUserMenu
          userName={userName}
          userLevel={userLevel}
          userAvatar={userAvatar}
          onProfile={() => onNavigate('perfil')}
          onLogout={onLogout}
        />
      </div>
    </nav>
  );
}
