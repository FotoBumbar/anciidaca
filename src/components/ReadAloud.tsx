import { useEffect, useRef, useState } from 'react'
import { Volume2, Square, Pause, Play } from 'lucide-react'

/** Device speech is an optional, free alternative to the AI narrator. */
export function ReadAloud({ text }: { text: string }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [status, setStatus] = useState<'idle' | 'reading' | 'paused'>('idle')
  const [error, setError] = useState('')
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const update = () => setVoices(window.speechSynthesis.getVoices().filter((v) => /^sr([-_]|$)/i.test(v.lang)))
    update(); window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => { window.speechSynthesis.removeEventListener('voiceschanged', update); window.speechSynthesis.cancel() }
  }, [])
  useEffect(() => () => window.speechSynthesis?.cancel(), [text])
  function start() {
    if (!voices.length) { setError('Na ovom uređaju nema srpskog glasa. Potrebno je uključiti srpski glas u podešavanjima uređaja.'); return }
    document.querySelectorAll('audio').forEach((audio) => audio.pause())
    const parts = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text]
    let index = 0
    setStatus('reading'); setError('')
    const next = () => {
      if (index >= parts.length) { setStatus('idle'); return }
      const u = new SpeechSynthesisUtterance(parts[index++]); utterance.current = u
      u.lang = 'sr-RS'; u.voice = voices[0]; u.rate = .9
      u.onend = next
      u.onerror = (e) => { if (e.error !== 'canceled' && e.error !== 'interrupted') setError('Čitanje je prekinuto. Pokušaj ponovo.'); setStatus('idle') }
      window.speechSynthesis.speak(u)
    }
    next()
  }
  return <div className="rounded-2xl border border-border bg-secondary/50 p-4">
    <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Čitanje naglas · glas uređaja · srpski</p>
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={status === 'idle' ? start : () => {
        if (status === 'reading') window.speechSynthesis.pause(); else window.speechSynthesis.resume()
        setStatus(status === 'reading' ? 'paused' : 'reading')
      }} className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm">{status === 'idle' ? <Volume2 size={16} /> : status === 'reading' ? <Pause size={16} /> : <Play size={16} />}{status === 'idle' ? 'Slušaj poglavlje' : status === 'reading' ? 'Pauziraj' : 'Nastavi'}</button>
      {status !== 'idle' && <button type="button" onClick={() => { window.speechSynthesis.cancel(); setStatus('idle') }} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><Square size={14} /> Zaustavi</button>}
    </div>
    {error && <p role="status" className="mt-2 text-sm text-primary">{error}</p>}
  </div>
}
