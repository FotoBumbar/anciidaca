
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Shell } from '@/components/Shell'
import { DriveImg, PhotoRotator } from '@/components/Photo'
import {
  buildStages,
  photos,
  TOGETHER_SINCE,
  videos,
  YOUTUBE_ID,
  type DriveItem,
} from '@/data/photos'
import { quotes } from '@/data/book'
import { useStore } from '@/data/store'

export const Route = createFileRoute('/')({
  component: Home,
})

function useTogether() {
  const [t, setT] = useState<{
    d: number
    h: number
    m: number
    s: number
  } | null>(null)

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(
        0,
        Date.now() - TOGETHER_SINCE.getTime(),
      ) / 1000

      setT({
        d: Math.floor(diff / 86400),
        h: Math.floor((diff % 86400) / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: Math.floor(diff % 60),
      })
    }

    tick()

    const id = setInterval(tick, 1000)

    return () => clearInterval(id)
  }, [])

  return t
}

function Home() {
  return (
    <Shell>
      <HomeContent />
    </Shell>
  )
}

function HomeContent() {
  const t = useTogether()
  const stages = buildStages()

  const [quote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)],
  )

  return (
    <>
      {/* HERO */}
      <section className="mx-auto grid max-w-content items-center gap-10 px-6 pb-16 pt-12 md:grid-cols-[1fr_1.05fr] md:py-20">
        <div className="rise-in relative">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            naše malo mesto na svetu
          </p>

          <p className="mt-6 font-hand text-3xl text-primary">
            Ćeć i Ćeća 💞
          </p>

          <h1 className="mt-2 font-display text-6xl leading-[1.08] font-medium tracking-tight md:text-8xl">
            David <span className="font-normal italic text-primary">&</span>
            <br />
            Anči
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Kad ti nedostajem, otvori ovo. Tu smo ti i ja — u svakoj fotki,
            svakoj reči i svakom malom koraku.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/album"
              className="rounded-full bg-primary px-6 py-3 text-sm text-white transition hover:-translate-y-1"
            >
              Zaviri u naše uspomene ↗
            </Link>

            <Link
              to="/knjiga"
              className="rounded-full border border-border bg-white px-6 py-3 text-sm transition hover:-translate-y-1"
            >
              Još jedna naša strana 📖
            </Link>
          </div>

          <p className="mt-8 font-hand text-xl text-muted-foreground">
            od onog „Bih.“ do svega što dolazi 🐢🐢
          </p>
        </div>

        <div
          className="rise-in relative mx-auto w-full max-w-xl rotate-[2deg] rounded-[1.5rem] border border-border bg-white p-3 pb-5 shadow-[0_24px_65px_#7d534e18]"
          style={{ animationDelay: '.15s' }}
        >
          <span
            aria-hidden
            className="absolute -top-4 left-1/3 z-20 h-9 w-28 -rotate-6 bg-[#efd9c9]/75"
          />

          <PhotoRotator
            count={7}
            className="aspect-[5/4] w-full rounded-xl"
          />

          <p className="mt-4 text-center font-hand text-2xl text-primary">
            moje omiljeno mesto je pored tebe ♡
          </p>
        </div>
      </section>

      {/* COUNTER */}
      <section className="mx-auto max-w-content px-4">
        <div className="rise-in mx-auto grid max-w-3xl grid-cols-4 gap-2 rounded-3xl border border-primary/40 bg-white/95 p-4 text-center shadow-[0_12px_45px_#7d534e0c] backdrop-blur md:gap-4 md:p-6">
          {[
            ['dana', t?.d],
            ['sati', t?.h],
            ['minuta', t?.m],
            ['sekundi', t?.s],
          ].map(([label, v]) => (
            <div key={label as string}>
              <div className="font-display text-3xl font-black tabular-nums text-foreground md:text-5xl">
                {v ?? '·'}
              </div>

              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {label}
              </div>
            </div>
          ))}

          <p className="col-span-4 mt-1 text-sm text-muted-foreground">
            zajedno, od 27. marta 2026. u 1:14h ❤️ „Bih.“
          </p>
        </div>
      </section>

      {/* TURTLES */}
      <section className="mx-auto mt-20 max-w-reading px-4 text-center">
        <div className="text-5xl">🐢💞🐢</div>

        <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
          Mi smo male kornjačice koje polako koračaju svetom
        </h2>

        <p className="font-hand mt-6 text-3xl leading-snug text-primary">
          „{quote}“
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          — iz Knjige bez tačke
        </p>
      </section>

      {/* STATS */}
      <section className="mx-auto mt-16 grid max-w-content grid-cols-2 gap-3 px-4 md:grid-cols-4">
        {[
          ['📸', photos.length, 'fotografija'],
          ['🎬', videos.length, 'videa'],
          ['🗓️', stages.length, 'etapa'],
          ['📖', '15+', 'poglavlja'],
        ].map(([e, n, l]) => (
          <div
            key={l as string}
            className="rounded-2xl border border-border bg-card/70 p-5 text-center"
          >
            <div className="text-3xl">{e}</div>

            <div className="mt-1 font-display text-3xl font-black">
              {n}
            </div>

            <div className="text-sm text-muted-foreground">{l}</div>
          </div>
        ))}
      </section>

      {/* FILM */}
      <section className="mx-auto mt-24 max-w-content px-4">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            🎬 naš filmić
          </p>

          <h2 className="mt-2 font-display text-4xl font-bold">
            Film života, glavne uloge: ti i ja
          </h2>
        </div>

        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-primary/40 shadow-[0_16px_60px_#7d534e12]">
          <div className="aspect-video">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?rel=0`}
              title="Naš filmić"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* STAGES */}
      <section className="mx-auto mt-24 max-w-content px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              🗓️ etape naše priče
            </p>

            <h2 className="mt-2 font-display text-4xl font-bold">
              Mesec po mesec
            </h2>
          </div>

          <Link
            to="/album"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:brightness-110"
          >
            Otvori ceo album 📸
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map((s, idx) => (
            <StageCard key={s.key} stage={s} seed={idx} />
          ))}
        </div>
      </section>

      {/* BOOK */}
      <section className="mx-auto mt-24 grid max-w-content items-center gap-10 px-4 md:grid-cols-[320px_1fr]">
        <Link
          to="/knjiga"
          className="mx-auto block w-64 rotate-[-3deg] transition hover:rotate-0 hover:scale-105 md:w-full"
        >
          <img
            src="/img/korice.jpg"
            alt="Knjiga bez tačke — korice"
            loading="eager"
            decoding="async"
            className="block h-auto w-full rounded-md object-contain shadow-[0_30px_60px_rgba(125,83,78,0.15)]"
          />
        </Link>

        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            📖 naša knjiga
          </p>

          <h2 className="mt-2 font-display text-5xl font-black">
            Knjiga bez tačke
          </h2>

          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Beskrajna priča koja čeka da bude ispričana. Pročitaj je,
            preuzmi je, i nastavimo je zajedno — sledeće strane su 31. jul,
            31. avgust, 18. septembar i daljina. ✍️
          </p>

          <Link
            to="/knjiga"
            className="mt-6 inline-block rounded-full border border-primary px-5 py-2.5 text-sm hover:bg-primary/20"
          >
            Čitaj i piši dalje →
          </Link>
        </div>
      </section>
    </>
  )
}

function StageCard({
  stage,
  seed,
}: {
  stage: {
    key: string
    title: string
    subtitle: string
    emoji: string
    line: string
    items: DriveItem[]
  }
  seed: number
}) {
  const { stageSettings } = useStore()
  const settings = stageSettings[stage.key]

  const [picks] = useState(() =>
    [...stage.items]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4),
  )

  return (
    <Link
      to="/album"
      hash={stage.key}
      className="group overflow-hidden rounded-3xl border border-border bg-card/70 transition hover:-translate-y-1 hover:border-primary/60"
    >
      {settings?.coverPhotoId ? (
        <DriveImg
          id={settings.coverPhotoId}
          alt={settings.title}
          className="aspect-[4/3] w-full bg-secondary object-contain"
        />
      ) : (
        <PhotoRotator
          items={picks}
          interval={4000 + seed * 600}
          className="aspect-[4/3] w-full"
        />
      )}

      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {stage.subtitle}
          </span>

          <span className="text-xs text-muted-foreground">
            {stage.items.length} 📸
          </span>
        </div>

        <h3 className="mt-1 font-display text-2xl font-bold">
          {stage.emoji} {settings?.title ?? stage.title}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          {stage.line}
        </p>
      </div>
    </Link>
  )
}
