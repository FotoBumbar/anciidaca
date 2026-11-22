import { useEffect, useRef, useState } from 'react'
import { Headphones, Square } from 'lucide-react'
import { narrationParts } from '@/lib/narration'

export function AINarrator({ chapterId, title, body }: { chapterId: string; title: string; body: string }) {
  const total = narrationParts(title, body).length
  const [part, setPart] = useState(0)
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState('')
  const [error, setError] = useState('')
  const requestRef = useRef<AbortController | null>(null)
  const urlRef = useRef('')
  const playerRef = useRef<HTMLAudioElement>(null)
  useEffect(() => () => {
    requestRef.current?.abort()
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
  }, [])

  function stop() {
    requestRef.current?.abort()
    playerRef.current?.pause()
    setLoading(false)
  }
  async function playPart(index: number) {
    requestRef.current?.abort()
    playerRef.current?.pause()
    const controller = new AbortController()
    requestRef.current = controller
    window.speechSynthesis?.cancel()
    setSource(''); setLoading(true); setError(''); setPart(index)
    try {
      const response = await fetch('/api/naracija', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, part: index }), signal: controller.signal,
      })
      if (!response.ok) throw new Error(response.status === 404 ? 'Prvo sačuvaj tekst poglavlja, pa pokreni čitanje.' : 'AI glas trenutno nije dostupan. Pokušaj ponovo ili izaberi glas uređaja.')
      const blob = await response.blob()
      if (controller.signal.aborted) return
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = URL.createObjectURL(blob)
      setSource(urlRef.current)
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Čitanje nije uspelo.')
    } finally { if (!controller.signal.aborted) setLoading(false) }
  }
  return <section className="mb-3 rounded-2xl border border-primary/20 bg-white p-4" aria-label="AI čitanje na srpskom">
    <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs uppercase tracking-widest text-primary">AI glas · ElevenLabs · srpski</p>{total > 0 && <span className="text-xs text-muted-foreground">Deo {part + 1} od {total}</span>}</div>
    <p className="mb-3 mt-2 text-sm text-muted-foreground">Zatvori oči, naša priča se nastavlja. ♡</p>
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" disabled={loading || !total} onClick={() => void playPart(part)} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"><Headphones size={16} />{loading ? 'Pripremamo glas…' : source ? 'Pusti ovaj deo ponovo' : 'Slušaj AI glas'}</button>
      {(loading || source) && <button type="button" onClick={stop} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><Square size={14} /> Zaustavi</button>}
    </div>
    {source && <audio key={source} ref={playerRef} src={source} controls autoPlay className="mt-3 w-full" aria-label="Čitanje poglavlja na srpskom" onEnded={() => { if (part + 1 < total) void playPart(part + 1) }} onError={() => setError('Ne možemo da pustimo snimak. Pokušaj ponovo.')} />}
    {source && total > 1 && <div className="mt-2 flex justify-between text-sm"><button disabled={loading || part === 0} onClick={() => void playPart(part - 1)} className="text-primary disabled:opacity-30">← Prethodni deo</button><button disabled={loading || part + 1 >= total} onClick={() => void playPart(part + 1)} className="text-primary disabled:opacity-30">Sledeći deo →</button></div>}
    {error && <p role="alert" className="mt-3 text-sm text-primary">{error}</p>}
    <p className="mt-3 text-xs text-muted-foreground">Snimak se pravi na zahtev i čuva za ponovno slušanje. Novi snimak nastaje tek kada izmeniš tekst.</p>
  </section>
}
