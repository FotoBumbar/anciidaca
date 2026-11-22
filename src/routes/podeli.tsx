import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { FloatingHearts } from '@/components/Shell'
import { PhotoCard } from '@/components/PhotoCard'
import { Lightbox } from '@/components/Lightbox'
import { downloadUrl, photos, type DriveItem } from '@/data/photos'
import { readShare } from '@/data/store'

export const Route = createFileRoute('/podeli')({
  validateSearch: (s: Record<string, unknown>) => ({ a: typeof s.a === 'string' ? s.a : '' }),
  head: () => ({ meta: [{ title: 'Uspomene · David & Anči' }, { name: 'robots', content: 'noindex' }] }),
  component: SharePage,
})

/** Public, read-only view for anyone who receives a link — no code needed. */
function SharePage() {
  const { a } = Route.useSearch()
  const [data, setData] = useState<{ title: string; items: DriveItem[] } | null | undefined>(undefined)
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    const parsed = readShare(a)
    if (!parsed) return setData(null)
    const byId = new Map(photos.map((p) => [p.id, p]))
    setData({ title: parsed.t, items: parsed.p.map((id) => byId.get(id) ?? { id, name: '', kind: 'photo', date: null }) })
  }, [a])

  return (
    <div className="relative min-h-screen px-4 pb-20 pt-14">
      <FloatingHearts count={10} />
      <div className="relative z-10 mx-auto max-w-content">
        <header className="text-center">
          <p className="animate-heartbeat inline-block text-4xl">❤️</p>
          <p className="mt-2 text-sm uppercase tracking-[0.3em] text-primary">David &amp; Anči dele sa tobom</p>
          <h1 className="mt-2 font-display text-5xl font-black">{data?.title ?? '…'}</h1>
          {data && <p className="font-hand mt-2 text-2xl text-primary">{data.items.length} uspomena · male kornjačice 🐢🐢</p>}
        </header>

        {data === null && <p className="mt-16 text-center text-muted-foreground">Ovaj link ne radi 🥺 Zamoli Davida ili Anči da ti pošalju novi.</p>}

        {data && (
          <>
            {data.items.length === 1 && (
              <div className="mt-6 text-center">
                <a href={downloadUrl(data.items[0].id)} target="_blank" rel="noreferrer" className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary">
                  ⬇️ Preuzmi fotografiju
                </a>
              </div>
            )}
            <div className={`masonry mx-auto mt-12 ${data.items.length < 3 ? 'max-w-2xl' : ''}`}>
              {data.items.map((p, i) => (
                <PhotoCard key={p.id} photo={p} onOpen={() => setOpen(i)} />
              ))}
            </div>
          </>
        )}
      </div>
      {data && open !== null && <Lightbox readOnly items={data.items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  )
}
