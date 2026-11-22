import { useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Gate, useUnlocked } from './Gate'
import { actions, useStore, type Author } from '@/data/store'

const HEARTS = ['❤️', '💕', '💗', '💞', '🤍', '🐢', '✨', '💘']

export function FloatingHearts({ count = 14 }: { count?: number }) {
  const hearts = Array.from({ length: count }, (_, i) => ({
    left: (i * 37.7 + 5) % 100, size: 14 + (i * 13) % 22,
    dur: 14 + (i * 7) % 14, delay: -(i * 3.7) % 20,
    drift: (i % 2 ? 1 : -1) * (20 + i * 3), e: HEARTS[i % HEARTS.length],
  }))
  return (
    <div aria-hidden>
      {hearts.map((h, i) => (
        <span
          key={i}
          className="floating-heart"
          style={
            {
              left: `${h.left}%`,
              fontSize: h.size,
              '--dur': `${h.dur}s`,
              '--delay': `${h.delay}s`,
              '--drift': `${h.drift}px`,
            } as React.CSSProperties
          }
        >
          {h.e}
        </span>
      ))}
    </div>
  )
}

const NAV = [
  { to: '/', label: 'Naš kutak', emoji: '🏡' },
  { to: '/album', label: 'Album', emoji: '📸' },
  { to: '/knjiga', label: 'Knjiga', emoji: '📖' },
] as const

function MeSwitch() {
  const { me } = useStore()
  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-white/80 p-1 text-xs" title="Ko sada piše komentare">
      {(['David', 'Anči'] as Author[]).map((a) => (
        <button
          key={a}
          onClick={() => actions.setMe(a)}
          className={`rounded-full px-3 py-1 transition ${me === a ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {a === 'David' ? '🧔 David' : '👩‍🦱 Anči'}
        </button>
      ))}
    </div>
  )
}

/** Wraps every private page: entry gate, navigation, floating hearts and the footer. */
export function Shell({ children }: { children: React.ReactNode }) {
  const { state, unlock } = useUnlocked()
  const store = useStore()
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (store.saving || store.error) e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [store.saving, store.error])

  if (state === 'checking') return <div className="min-h-screen" />
  if (state === 'locked')
    return (
      <>
        <FloatingHearts count={18} />
        <Gate onUnlock={unlock} />
      </>
    )

  return (
    <div className="relative min-h-screen">
      <FloatingHearts />
      <header className="no-print sticky top-0 z-40 border-b border-border/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-content flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="animate-heartbeat inline-block text-xl">❤️</span>
            <span className="font-display text-lg font-black uppercase tracking-[0.15em]">David &amp; Anči</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                activeProps={{ className: 'bg-secondary !text-foreground' }}
                activeOptions={{ exact: n.to === '/' }}
              >
                <span className="mr-1">{n.emoji}</span>
                {n.label}
              </Link>
            ))}
          </nav>
          <MeSwitch />
        </div>
      </header>

      <main className="relative z-10">
        {store.error && <div role="alert" className="no-print mx-auto mt-5 max-w-content rounded-2xl border border-primary/30 bg-accent px-5 py-4 text-sm">{store.error} <button onClick={() => void actions.retrySync()} className="ml-2 underline">Pokušaj ponovo</button></div>}
        {!store.ready ? <div role="status" className="no-print mx-auto max-w-content p-10 text-center text-muted-foreground">Otvaramo naše zajedničke uspomene… ♡</div> : <>
          <p role="status" className="no-print mx-auto max-w-content px-4 pt-3 text-right text-xs text-muted-foreground">{store.saving ? 'Čuvamo naše izmene…' : store.error ? 'Čekamo vezu za čuvanje' : '♡ Zajedničke uspomene su sačuvane'}</p>
          {children}
        </>}
      </main>

      <footer className="no-print relative z-10 mt-24 overflow-hidden border-t border-border/60 py-10 text-center text-sm text-muted-foreground">
        <div className="turtle-walk pointer-events-none absolute top-2 text-2xl" aria-hidden>
          🐢🐢
        </div>
        <p className="font-hand text-2xl text-primary">Mi smo male kornjačice koje polako koračaju svetom 🐢💞🐢</p>
        <p className="mt-3">Od 27. marta 2026, 1:14h · Ćeć i Ćeća · zauvek bez tačke</p>
        <p className="mt-4 inline-block rounded-full border border-dashed border-primary/60 px-4 py-2">
          📸 Ako sajt baguje — skrinuj i pošalji Davidu, on će to popraviti (valjda) 😂🛠️
        </p>
      </footer>
    </div>
  )
}
