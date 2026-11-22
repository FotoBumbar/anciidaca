import { useEffect, useRef, useState } from 'react'

const CODE = '2703'
const KEY = 'david-anci-unlocked'

export function useUnlocked() {
  const [state, setState] = useState<'checking' | 'locked' | 'open'>('checking')
  useEffect(() => {
    setState(localStorage.getItem(KEY) === CODE ? 'open' : 'locked')
  }, [])
  const unlock = () => {
    localStorage.setItem(KEY, CODE)
    setState('open')
  }
  return { state, unlock }
}

/** Entry screen: a beating heart and our date (27.03.) as the code. */
export function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)
  const [opening, setOpening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => inputRef.current?.focus(), [])

  function submit(v: string) {
    if (v === CODE) {
      setOpening(true)
      setTimeout(onUnlock, 1100)
    } else {
      setWrong(true)
      setTimeout(() => {
        setWrong(false)
        setValue('')
      }, 500)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center transition-all duration-1000 ${
        opening ? 'scale-110 opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'radial-gradient(ellipse at 50% 38%, #fff 0%, #fff7f2 48%, #f8e7e2 100%)' }}
    >
      <div className="relative mb-8">
        <svg viewBox="0 0 32 29.6" className="animate-heartbeat h-36 w-36 drop-shadow-[0_0_40px_rgba(217,132,145,0.2)] md:h-44 md:w-44">
          <path
            fill="#d98491"
            d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center pb-3 font-display text-2xl font-black tracking-wider text-foreground md:text-3xl">
          D&nbsp;♥&nbsp;A
        </span>
      </div>

      <h1 className="font-display text-4xl font-black uppercase tracking-[0.12em] md:text-6xl">David &amp; Anči</h1>
      <p className="font-hand mt-3 text-2xl text-primary md:text-3xl">Ćeć i Ćeća · male kornjačice 🐢🐢</p>

      <form
        className={`mt-10 flex flex-col items-center gap-4 ${wrong ? 'animate-shake' : ''}`}
        onSubmit={(e) => {
          e.preventDefault()
          submit(value)
        }}
      >
        <label htmlFor="code" className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Upiši naš datum 💘
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="code"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={value}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4)
              setValue(v)
              if (v.length === 4) submit(v)
            }}
            className="w-56 rounded-2xl border-2 border-primary/60 bg-white/80 py-4 text-center font-display text-4xl tracking-[0.6em] text-foreground outline-none transition focus:border-primary focus:shadow-[0_0_30px_rgba(200,16,46,0.5)]"
            placeholder="••••"
            aria-label="Šifra"
          />
        </div>
        <p className="h-5 text-sm text-primary">{wrong ? 'Hmm, nije to naš dan 🙈 probaj opet' : opening ? 'Dobrodošla kući, Srećice 💞' : ''}</p>
      </form>
    </div>
  )
}
