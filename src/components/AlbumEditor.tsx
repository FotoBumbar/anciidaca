import { useState } from 'react'
import { Pencil, Check } from 'lucide-react'
import { DriveImg } from './Photo'
import { type DriveItem } from '@/data/photos'

export function AlbumEditor({ title, coverPhotoId, items, onSave }: { title: string; coverPhotoId?: string; items: DriveItem[]; onSave: (title: string, cover?: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(title)
  const [cover, setCover] = useState(coverPhotoId)
  const [busy, setBusy] = useState(false)
  return <div>
    <button type="button" onClick={() => { setName(title); setCover(coverPhotoId); setOpen(!open) }} className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm"><Pencil size={14} /> Uredi naziv i naslovnu</button>
    {open && <form className="pastel-card mt-4 max-w-2xl p-5" onSubmit={async (e) => {
      e.preventDefault(); if (!name.trim()) return
      setBusy(true)
      try { await onSave(name.trim(), cover); setOpen(false) } finally { setBusy(false) }
    }}>
      <label className="block text-sm">Naziv albuma ili etape<input required maxLength={300} value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border bg-background p-3" /></label>
      <p className="mb-3 mt-4 text-sm text-muted-foreground">Izaberi naslovnu fotografiju. Cela fotografija ostaje u svom formatu.</p>
      <button type="button" onClick={() => setCover(undefined)} className="mb-3 text-sm text-primary underline">Vrati automatski izbor</button>
      <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">
        {items.map((p, i) => <button type="button" key={p.id} aria-label={`Naslovna fotografija ${i + 1}`} aria-pressed={cover === p.id} onClick={() => setCover(p.id)} className={`relative rounded-lg border-2 p-1 ${cover === p.id ? 'border-primary bg-accent' : 'border-transparent bg-secondary'}`}><DriveImg id={p.id} w={200} alt={`Fotografija ${i + 1}`} className="h-24 w-full object-contain" />{cover === p.id && <Check className="absolute right-1 top-1 rounded-full bg-white p-1 text-primary" />}</button>)}
      </div>
      {!items.length && <p className="text-sm text-muted-foreground">Prvo dodaj fotografije u album, pa izaberi naslovnu.</p>}
      <div className="mt-4 flex gap-2"><button disabled={busy} className="rounded-full bg-primary px-5 py-2 text-sm text-white">{busy ? 'Čuvam…' : 'Sačuvaj izmene'}</button><button type="button" onClick={() => setOpen(false)} className="rounded-full border px-5 py-2 text-sm">Otkaži</button></div>
    </form>}
  </div>
}
