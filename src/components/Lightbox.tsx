import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Share2, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { DriveImg } from './Photo'
import { downloadUrl, formatDate, photoPersonality, specialDayFor, type DriveItem } from '@/data/photos'
import { actions, shareLink, useStore } from '@/data/store'

const timeFmt = (iso: string) =>
  new Date(iso).toLocaleString('sr-Latn-RS', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export async function copyShare(title: string, ids: string[]) {
  const link = shareLink(title, ids)
  try {
    if (navigator.share) {
      await navigator.share({ title: `${title} · David & Anči`, url: link })
      return
    }
  } catch {
    /* user cancelled native share — fall back to copying */
  }
  await navigator.clipboard?.writeText(link)
  toast.success('Javni link je kopiran 💌', { description: 'Ko god ga otvori vidi samo ove fotografije.' })
}

/** Full-screen photo in its exact original format, with memory, comments and albums. */
export function Lightbox({ items, index, onIndex, onClose, readOnly }: { items: DriveItem[]; index: number; onIndex: (i: number) => void; onClose: () => void; readOnly?: boolean }) {
  const photo = items[index]
  const store = useStore()
  const p = photoPersonality(photo.id)
  const special = specialDayFor(photo.date)
  const memory = store.memories[photo.id]
  const comments = store.comments.filter((c) => c.photoId === photo.id)

  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [comment, setComment] = useState('')
  const [hearts, setHearts] = useState<number[]>([])

  useEffect(() => {
    setTitle(memory?.title ?? '')
    setNote(memory?.note ?? '')
  }, [photo.id, memory?.title, memory?.note])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA/)) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % items.length)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, items.length, onClose, onIndex])

  const burst = () => {
    const id = Date.now()
    setHearts((h) => [...h, id])
    setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1200)
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white/95 backdrop-blur-sm lg:flex-row" role="dialog" aria-modal>
      <button onClick={onClose} aria-label="Zatvori" className="absolute right-3 top-3 z-20 rounded-full bg-secondary/80 p-2 hover:bg-secondary">
        <X className="h-5 w-5" />
      </button>

      {/* the photo — never cropped */}
      <div className="relative flex min-h-[55vh] flex-1 items-center justify-center p-3 lg:p-8" onDoubleClick={burst}>
        <DriveImg key={photo.id} id={photo.id} w={2000} eager className="rise-in max-h-[52vh] max-w-full rounded-md object-contain shadow-2xl lg:max-h-[88vh]" />
        {hearts.map((h) => (
          <span key={h} className="animate-heartbeat pointer-events-none absolute text-8xl">
            ❤️
          </span>
        ))}
        <button onClick={() => onIndex((index - 1 + items.length) % items.length)} aria-label="Prethodna" className="absolute left-2 rounded-full bg-secondary/80 p-2 hover:bg-secondary">
          <ChevronLeft />
        </button>
        <button onClick={() => onIndex((index + 1) % items.length)} aria-label="Sledeća" className="absolute right-2 rounded-full bg-secondary/80 p-2 hover:bg-secondary">
          <ChevronRight />
        </button>
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
          {index + 1} / {items.length} · dupli klik = ❤️
        </span>
      </div>

      {/* its own little story */}
      <aside className="max-h-[45vh] w-full overflow-y-auto border-t border-border bg-[#fffaf7] p-5 lg:max-h-none lg:w-[400px] lg:border-l lg:border-t-0">
        <div className="flex items-start gap-3">
          <span className="text-4xl">{p.emoji}</span>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{photo.date ? formatDate(photo.date) : 'trenutak bez datuma'}</p>
            {special && (
              <p className="mt-1 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                {special.emoji} {special.label}
              </p>
            )}
          </div>
        </div>
        <blockquote className="font-hand mt-4 border-l-2 border-primary pl-3 text-xl leading-snug text-primary">„{p.quote}“</blockquote>

        {readOnly ? (
          memory && (
            <div className="mt-5">
              <h3 className="font-display text-xl">{memory.title}</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{memory.note}</p>
            </div>
          )
        ) : (
          <>
            <section className="mt-6">
              <h3 className="mb-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">📝 Uspomena uz ovu fotku</h3>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Naslov (npr. Kapitol, naša klupica)"
                className="w-full rounded-lg border border-border bg-white/80 px-3 py-2 font-display outline-none focus:border-primary"
              />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Šta se tada desilo, šta smo pričali, šta osećamo…"
                className="mt-2 w-full resize-none rounded-lg border border-border bg-white/80 px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{memory ? `${memory.author} · ${timeFmt(memory.updatedAt)}` : ''}</span>
                <button
                  onClick={async () => {
                    await actions.saveMemory(photo.id, title.trim(), note.trim())
                  }}
                  className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:brightness-110"
                >
                  Sačuvaj
                </button>
              </div>
            </section>

            <section className="mt-6">
              <h3 className="mb-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">💬 Komentari ({comments.length})</h3>
              <ul className="space-y-2">
                {comments.map((c) => (
                  <li key={c.id} className="group rounded-xl bg-secondary/60 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {c.author === 'David' ? '🧔' : '👩‍🦱'} <b className="text-foreground">{c.author}</b> · {timeFmt(c.at)}
                      </span>
                      <button onClick={() => actions.deleteComment(c.id)} className="opacity-0 transition group-hover:opacity-100" aria-label="Obriši">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
                  </li>
                ))}
              </ul>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!comment.trim()) return
                  actions.addComment(photo.id, comment.trim())
                  setComment('')
                  burst()
                }}
              >
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Napiši nešto kao ${store.me}… 💌`}
                  className="flex-1 rounded-full border border-border bg-white/80 px-4 py-2 text-sm outline-none focus:border-primary"
                />
                <button className="rounded-full bg-primary px-4 text-sm text-primary-foreground">➤</button>
              </form>
            </section>

            <section className="mt-6">
              <h3 className="mb-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">📚 U albumima</h3>
              <div className="flex flex-wrap gap-2">
                {store.albums.map((a) => {
                  const on = a.photoIds.includes(photo.id)
                  return (
                    <button
                      key={a.id}
                      onClick={() => actions.toggleInAlbum(a.id, photo.id)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${on ? 'border-primary bg-primary/25 text-foreground' : 'border-border text-muted-foreground hover:border-primary/60'}`}
                    >
                      {on ? '✓ ' : '+ '}
                      {a.emoji} {a.title}
                    </button>
                  )
                })}
              </div>
            </section>
          </>
        )}

        <div className="mt-6 flex gap-2">
          <a href={downloadUrl(photo.id)} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-2 text-sm hover:border-primary">
            <Download className="h-4 w-4" /> Preuzmi original
          </a>
          {!readOnly && (
            <button onClick={() => copyShare(memory?.title || 'Jedan naš trenutak', [photo.id])} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-2 text-sm hover:border-primary">
              <Share2 className="h-4 w-4" /> Podeli
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}
