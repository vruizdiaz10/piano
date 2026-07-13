import { getSessions } from '../utils/sessionHistory'

export default function ProgressChart() {
  const sessions = getSessions().slice(0, 10)
  if (sessions.length < 2) return null

  const maxY = 40
  const w = sessions.length * 24
  const h = maxY + 20
  const pts = sessions.map((s, i) => ({
    x: i * 24 + 12,
    y: maxY - (s.accuracy / 100) * maxY + 10,
    acc: s.accuracy,
  }))

  return (
    <div className="mt-4">
      <div className="text-xs font-semibold text-muted-foreground mb-1.5 text-center">Progreso</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[240px] h-auto mx-auto" aria-label="Gráfico de progreso de sesiones anteriores">
        <line x1={0} y1={maxY + 10} x2={w} y2={maxY + 10} stroke="var(--gold-dim)" strokeWidth="1" />
        {pts.map((p, i) => i > 0 && (
          <line key={`l${i}`} x1={pts[i-1].x} y1={pts[i-1].y} x2={p.x} y2={p.y} stroke="var(--gold)" strokeWidth="1.5" opacity={0.4} />
        ))}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.acc >= 80 ? 4 : p.acc >= 50 ? 4 : 3}
            fill={p.acc >= 80 ? 'var(--success, #22C55E)' : 'none'}
            stroke={p.acc >= 50 && p.acc < 80 ? 'var(--gold)' : p.acc < 50 ? 'var(--destructive)' : 'none'}
            strokeWidth={1.5}
            opacity={p.acc >= 80 ? 0.9 : p.acc >= 50 ? 0.7 : 0.5}>
            <title>{Math.round(p.acc)}%</title>
          </circle>
        ))}
      </svg>
    </div>
  )
}
