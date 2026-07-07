import { ReactNode } from 'react'

interface OrnateFrameProps {
  children: ReactNode
}

export default function OrnateFrame({ children }: OrnateFrameProps) {
  return (
    <div className="relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <svg width="120" height="12" viewBox="0 0 120 12" aria-hidden="true">
          <path d="M0,6 Q15,0 30,6 Q45,12 60,6 Q75,0 90,6 Q105,12 120,6" fill="none" stroke="var(--gold)" strokeWidth="1" />
          <circle cx="60" cy="6" r="2" fill="var(--gold)" />
        </svg>
      </div>
      {[0,1,2,3].map(i => (
        <div key={i} className={`absolute ${['-top-2 -left-2','-top-2 -right-2','-bottom-2 -left-2','-bottom-2 -right-2'][i]} z-20 pointer-events-none`}>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d={[
              'M0,24 L0,0 L24,0',
              'M24,24 L24,0 L0,0',
              'M0,0 L0,24 L24,24',
              'M24,0 L24,24 L0,24',
            ][i]} fill="none" stroke="var(--gold)" strokeWidth="1.5" />
            <path d={[
              'M4,20 L4,4 L20,4',
              'M20,20 L20,4 L4,4',
              'M4,4 L4,20 L20,20',
              'M20,4 L20,20 L4,20',
            ][i]} fill="none" stroke="var(--gold-dim)" strokeWidth="0.5" />
            <circle cx={[4,20,4,20][i]} cy={[4,4,20,20][i]} r="1.5" fill="var(--gold)" />
          </svg>
        </div>
      ))}
      {children}
    </div>
  )
}
