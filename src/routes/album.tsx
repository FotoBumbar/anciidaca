import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Share2, Trash2 } from 'lucide-react'
import { Shell } from '@/components/Shell'
import { AlbumEditor } from '@/components/AlbumEditor'
import { PhotoCard } from '@/components/PhotoCard'
import { Lightbox, copyShare } from '@/components/Lightbox'
import { DriveImg } from '@/components/Photo'
import { buildStages, DRIVE_FOLDER_URL, formatDate, photos, SYNCED_AT, videoEmbedUrl, videos, type DriveItem } from '@/data/photos'
import { actions, useStore } from '@/data/store'

export const Route = createFileRoute('/album')({
  head: () => ({ meta: [{ title: 'Album · David & Anči' }] }),
  component: () => (
    <Shell>
      <AlbumPage />
    </Shell>
  ),
})

type Tab = 'etape' | 'albumi' | 'videi'

function AlbumPage() {
  const { stageSettings } = useStore()
  const [tab, setTab] = useState<Tab>('etape')
  const [open, setOpen] = useState<{ items: DriveItem[]; index: number } | null>(null)
  const stages = buildStages()
  const openAt = (items: DriveItem[], index: number) => setOpen({ items, index })

  return (
    <div className="mx-auto max-w-content px-4 pt-10">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">📸 naš album</p>
        <h1 className="mt-2 font-display text-5xl font-black md:text-6xl">Svaka fotka ima svoju priču</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          {photos.length} fotografija i {videos.length} videa, svaka u svom pravom formatu. Klikni na fotku da joj dodaš uspomenu ili komentar, ili da je
          staviš u album. 💞
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
          <a href={DRIVE_FOLDER_URL} target="_blank" rel="noreferrer" className="rounded-full border border-border px-4 py-2 hover:border-primary">
            ➕ Dodaj nove slike u naš Drive
          </a>
          <span className="rounded-full bg-secondary px-4 py-2 text-muted-foreground">🔄 Osveženo sa Drive-a: {formatDate(SYNCED_AT)}</span>
        </div>
      </div>

      <div className="sticky top-[60px] z-30 mt-10 flex justify-center">
        <div className="flex gap-1 rounded-full border border-border bg-white/95 p-1 backdrop-blur">
          {(
            [
              ['etape', '🗓️ Etape'],
              ['albumi', '📚 Naši albumi'],
              ['videi', '🎬 Videi'],
            ] as [Tab, string][]
          ).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-2 text-sm transition ${tab === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {tab === 'etape' && (
        <>
          <nav className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {stages.map((s) => (
              <a key={s.key} href={`#${s.key}`} className="shrink-0 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-foreground">
                {s.emoji} {s.subtitle} <span className="text-xs opacity-60">({s.items.length})</span>
              </a>
            ))}
          </nav>
          {stages.map((s) => (
            <section key={s.key} id={s.key} className="scroll-mt-32 pt-14">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{s.subtitle}</p>
                  <h2 className="font-display text-3xl font-bold md:text-4xl">
                    {s.emoji} {stageSettings[s.key]?.title ?? s.title}
                  </h2>
                  <p className="font-hand text-xl text-primary">{s.line}</p>
                </div>
                <button onClick={() => copyShare(`${stageSettings[s.key]?.title ?? s.title} · ${s.subtitle}`, s.items.map((p) => p.id))} className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-primary">
                  <Share2 className="h-4 w-4" /> Podeli etapu
                </button>
              </div>
              <div className="mb-6"><AlbumEditor title={stageSettings[s.key]?.title ?? s.title} coverPhotoId={stageSettings[s.key]?.coverPhotoId} items={s.items} onSave={(title, cover) => actions.updateStage(s.key, title, cover)} /></div>
              {stageSettings[s.key]?.coverPhotoId && <DriveImg id={stageSettings[s.key].coverPhotoId!} alt="Naslovna fotografija etape" className="mb-6 max-h-96 w-full rounded-2xl bg-secondary object-contain" />}
              <div className="masonry">
                {s.items.map((p, i) => (
                  <PhotoCard key={p.id} photo={p} onOpen={() => openAt(s.items, i)} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      {tab === 'albumi' && <Albums onOpen={openAt} />}

      {tab === 'videi' && <Videos />}

      {open && <Lightbox items={open.items} index={open.index} onIndex={(index) => setOpen({ ...open, index })} onClose={() => setOpen(null)} />}
    </div>
  )
}

const ALBUM_EMOJIS = ['💞', '🌹', '🍒', '🌙', '🐢', '🎭', '🚐', '☀️', '🎓', '🥞']

function Albums({ onOpen }: { onOpen: (items: DriveItem[], index: number) => void }) {
  const { albums } = useStore()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState(ALBUM_EMOJIS[1])
  const byId = new Map(photos.map((p) => [p.id, p]))

  return (
    <div className="mt-10">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          actions.createAlbum(title.trim(), emoji)
          setTitle('')
        }}
        className="mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-3xl border border-dashed border-primary/50 p-4"
      >
        <select value={emoji} onChange={(e) => setEmoji(e.target.value)} className="rounded-full border border-border bg-white/80 px-3 py-2 text-lg" aria-label="Emodži">
          {ALBUM_EMOJIS.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Novi album (npr. Yes Day, Temišvar, Matura…)"
          className="min-w-0 flex-1 rounded-full border border-border bg-white/80 px-4 py-2 outline-none focus:border-primary"
        />
        <button className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
          <Plus className="h-4 w-4" /> Napravi
        </button>
        <p className="w-full text-center text-xs text-muted-foreground">Fotke dodaješ u album kad otvoriš fotku → „U albumima“ ✨</p>
      </form>

      <div className="mt-10 space-y-14">
        {albums.map((a) => {
          const items = a.photoIds.map((id) => byId.get(id)).filter(Boolean) as DriveItem[]
          return (
            <section key={a.id}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                <h2 className="font-display text-3xl font-bold">
                  {a.emoji} {a.title} <span className="text-base font-normal text-muted-foreground">· {items.length} 📸</span>
                </h2>
                <div className="flex gap-2">
                  <button
                    disabled={!items.length}
                    onClick={() => copyShare(a.title, a.photoIds)}
                    className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-primary disabled:opacity-40"
                  >
                    <Share2 className="h-4 w-4" /> Javni link
                  </button>
                  {a.id !== 'omiljene' && (
                    <button onClick={() => confirm(`Obrisati album „${a.title}“? Fotke ostaju u etapama.`) && actions.deleteAlbum(a.id)} className="rounded-full border border-border p-2 hover:border-destructive" aria-label="Obriši album">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mb-5"><AlbumEditor title={a.title} coverPhotoId={a.coverPhotoId} items={items} onSave={(title, cover) => actions.updateAlbum(a.id, title, cover)} /></div>
              {a.coverPhotoId && items.some((p) => p.id === a.coverPhotoId) && <DriveImg id={a.coverPhotoId} alt={`Naslovna — ${a.title}`} className="mb-6 max-h-96 w-full rounded-2xl bg-secondary object-contain" />}
              {items.length ? (
                <div className="masonry">
                  {items.map((p, i) => (
                    <PhotoCard key={p.id} photo={p} onOpen={() => onOpen(items, i)} />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-secondary/40 p-6 text-center text-muted-foreground">Još je prazan 🥺 Otvori neku fotku iz etapa i dodaj je ovde.</p>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Videos() {
  const [playing, setPlaying] = useState<string | null>(null)
  return (
    <div className="mt-10">
      <div className="masonry">
        {videos.map((v) => (
          <div key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            {playing === v.id ? (
              <iframe src={videoEmbedUrl(v.id)} className="aspect-[9/16] w-full" allow="autoplay" allowFullScreen title={v.name} />
            ) : (
              <button onClick={() => setPlaying(v.id)} className="group relative block w-full">
                <DriveImg id={v.id} w={500} className="block h-auto min-h-32 w-full bg-black" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-5xl transition group-hover:bg-black/10">▶️</span>
              </button>
            )}
            <p className="px-3 py-2 text-xs text-muted-foreground">{v.date ? formatDate(v.date) : 'video'} 🎬</p>
          </div>
        ))}
      </div>
    </div>
  )
}
