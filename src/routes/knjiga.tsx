import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, Pencil, Plus, Printer, X } from 'lucide-react'
import { Shell } from '@/components/Shell'
import { ReadAloud } from '@/components/ReadAloud'
import { AINarrator } from '@/components/AINarrator'
import { BOOK_COVER, BOOK_PDF, quotes } from '@/data/book'
import { actions, useStore, type Draft } from '@/data/store'

export const Route = createFileRoute('/knjiga')({
  head: () => ({ meta: [{ title: 'Knjiga bez tačke · David & Anči' }] }),
  component: () => <Shell><BookPage /></Shell>,
})

function BookPage() {
  const { drafts, error, saving } = useStore()
  const [stage, setStage] = useState('Sve etape')
  const [selected, setSelected] = useState('uvod')
  const [editing, setEditing] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const stages = ['Sve etape', ...new Set(drafts.map((d) => d.stage ?? 'Nastavljamo'))]
  const visible = drafts.filter((d) => stage === 'Sve etape' || (d.stage ?? 'Nastavljamo') === stage)
  const current = visible.find((d) => d.id === selected) ?? visible[0]
  const index = visible.findIndex((d) => d.id === current?.id)
  const written = drafts.filter((d) => d.body.trim())
  const canLeave = () => !dirty || window.confirm('Napustiti izmene koje još nisu sačuvane?')
  const choose = (id: string) => { if (canLeave()) { setSelected(id); setEditing(false); setDirty(false) } }

  return <>
    <div className="no-print mx-auto max-w-content px-4 pt-12">
      <section className="grid items-center gap-10 md:grid-cols-[210px_1fr]">
        <img src={BOOK_COVER} alt="Originalne korice Knjige bez tačke" className="mx-auto w-44 -rotate-3 rounded-md shadow-[0_18px_45px_#7d534e20] md:w-full" />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">Anči &amp; David · priča koja raste</p>
          <h1 className="mt-3 font-display text-5xl font-medium tracking-tight md:text-7xl">Knjiga bez <em className="text-primary">tačke</em></h1>
          <p className="mt-4 font-hand text-2xl text-muted-foreground">Neke stranice su već naše. Druge tek čekaju da ih zajedno ispišemo.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <a href={BOOK_PDF} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border bg-white px-4 py-2"><Download size={16} /> Originalni PDF</a>
            <button onClick={() => { if (!saving && !error) window.print() }} disabled={saving || !!error} className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-white disabled:opacity-50"><Printer size={16} /> Sačuvaj uređenu knjigu kao PDF</button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Izmene čuvamo u zajedničkoj knjizi. Originalni PDF ostaje dostupan. Za novu verziju u štampi izaberi „Sačuvaj kao PDF“.</p>
        </div>
      </section>

      <section className="mt-14" id="citanje">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.25em] text-primary">jedna po jedna uspomena</p><h2 className="mt-2 font-display text-3xl">Listaj našu priču</h2></div>
          <label className="text-sm text-muted-foreground">Etapa <select aria-label="Etapa knjige" value={stage} onChange={(e) => { if (canLeave()) { setStage(e.target.value); setEditing(false); setDirty(false) } }} className="ml-2 rounded-full border bg-white px-4 py-2">{stages.map((s) => <option key={s}>{s}</option>)}</select></label>
        </div>
        <div className="book-spread grid overflow-hidden rounded-3xl border border-border md:grid-cols-[280px_1fr]">
          <nav aria-label="Poglavlja knjige" className="border-b border-border bg-secondary/30 p-5 md:border-b-0 md:border-r">
            <p className="mb-4 font-hand text-2xl text-primary">Sadržaj ♡</p>
            <div className="flex max-h-64 gap-2 overflow-auto md:max-h-[780px] md:flex-col">
              {visible.map((d, i) => <button key={d.id} onClick={() => choose(d.id)} aria-current={d.id === current?.id ? 'page' : undefined} className={`min-w-44 rounded-xl px-3 py-3 text-left text-sm transition md:min-w-0 ${d.id === current?.id ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:bg-white/70'}`}><span className="mb-1 block text-[10px] uppercase tracking-widest opacity-70">{String(i + 1).padStart(2, '0')} · {d.stage ?? 'Nastavljamo'}</span>{d.emoji} {d.title}</button>)}
            </div>
          </nav>
          {current && <article className="min-w-0 p-5 md:px-10 md:py-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{current.stage ?? 'Nastavljamo'} · {index + 1} / {visible.length}</span>
              <button onClick={() => { if (canLeave()) { setEditing(!editing); setDirty(false) } }} className="flex items-center gap-2 rounded-full border bg-white px-4 py-2">{editing ? <X size={14} /> : <Pencil size={14} />}{editing ? 'Zatvori uređivanje' : 'Prepravi poglavlje'}</button>
            </div>
            {editing ? <ChapterEditor key={current.id} draft={current} onDirty={setDirty} onDone={() => setEditing(false)} /> : <>
              <div key={current.id} className="rise-in">
                <h3 className="font-display text-3xl leading-tight md:text-4xl">{current.title}</h3>
                <div className="mt-6"><AINarrator key={`${current.id}-${current.updatedAt}`} chapterId={current.id} title={current.title} body={current.body} /><ReadAloud text={`${current.title}. ${current.body}`} /></div>
                <div className="mt-8 whitespace-pre-wrap break-words text-[17px] leading-[1.95] text-foreground/90">{current.body || 'Ova strana čeka nas. Klikni na „Prepravi poglavlje“ i sačuvaj prvi red naše nove uspomene. ✍️'}</div>
              </div>
              <div className="mt-10 flex justify-between gap-3 border-t pt-5">
                <button disabled={index <= 0} onClick={() => choose(visible[index - 1].id)} className="flex items-center gap-1 rounded-full border bg-white px-3 py-2 text-sm disabled:opacity-30"><ChevronLeft size={16} /> Prethodno</button>
                <button disabled={index >= visible.length - 1} onClick={() => choose(visible[index + 1].id)} className="flex items-center gap-1 rounded-full border bg-white px-3 py-2 text-sm disabled:opacity-30">Sledeće <ChevronRight size={16} /></button>
              </div>
            </>}
          </article>}
        </div>
      </section>

      <form id="nastavak" className="pastel-card mt-8 flex flex-wrap items-end gap-3 p-6" onSubmit={(e) => {
        e.preventDefault(); if (!newTitle.trim() || !canLeave()) return
        setDirty(false)
        const id = actions.addDraft(newTitle.trim()); setNewTitle(''); setStage('Sve etape'); choose(id); setEditing(true)
      }}>
        <label className="min-w-0 flex-1 text-sm text-muted-foreground">Još jedna naša etapa<input required maxLength={300} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Naslov novog poglavlja…" className="mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-foreground" /></label>
        <button className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm text-white"><Plus size={16} /> Dodaj poglavlje</button>
      </form>
      <p className="mt-3 text-center text-sm text-muted-foreground">31. jul, 31. avgust, 18. septembar i Daljina već čekaju u sadržaju. 🐢</p>
      <section className="mt-16"><h2 className="font-display text-3xl">Reči koje čuvamo 💌</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{quotes.slice(0, 4).map((q) => <blockquote key={q} className="pastel-card bg-secondary/40 p-6 font-hand text-2xl text-primary">„{q}“</blockquote>)}</div><p className="mt-4 text-sm text-muted-foreground">Pesme su sačuvane u poglavljima, na svojim mestima u priči.</p></section>
    </div>
    <div className="print-only"><div className="print-page"><img src={BOOK_COVER} alt="Korice" style={{ maxHeight: '95vh', margin: '0 auto' }} /></div>{written.map((d) => <article key={d.id} className="print-page" style={{ padding: '1.5cm', lineHeight: 1.8 }}><p>{d.stage}</p><h1 style={{ fontSize: 28 }}>{d.title}</h1><div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{d.body}</div></article>)}</div>
  </>
}

function ChapterEditor({ draft, onDone, onDirty }: { draft: Draft; onDone: () => void; onDirty: (dirty: boolean) => void }) {
  const [title, setTitle] = useState(draft.title)
  const [body, setBody] = useState(draft.body)
  const [stage, setStage] = useState(draft.stage ?? 'Nastavljamo')
  const [busy, setBusy] = useState(false)
  const { error } = useStore()
  const dirty = title !== draft.title || body !== draft.body || stage !== (draft.stage ?? 'Nastavljamo')
  useEffect(() => { onDirty(dirty); return () => onDirty(false) }, [dirty, onDirty])
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  return <form onSubmit={async (e) => { e.preventDefault(); setBusy(true); await actions.editDraft(draft.id, { title: title.trim(), body, stage: stage.trim() || 'Nastavljamo' }); setBusy(false) }} className="space-y-4">
    <label className="block text-sm">Naslov<input required maxLength={300} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 block w-full rounded-xl border bg-white p-3" /></label>
    <label className="block text-sm">Etapa<input maxLength={300} value={stage} onChange={(e) => setStage(e.target.value)} className="mt-2 block w-full rounded-xl border bg-white p-3" /></label>
    <label className="block text-sm">Tekst poglavlja<textarea maxLength={200000} rows={18} value={body} onChange={(e) => setBody(e.target.value)} className="mt-2 block w-full resize-y rounded-xl border bg-white p-4 text-base leading-8" /></label>
    <p role="status" className="text-sm text-muted-foreground">{busy ? 'Čuvam u zajedničkoj knjizi…' : error ? 'Izmene još nisu sačuvane. Pokušaj ponovo preko poruke na vrhu.' : dirty ? 'Imaš izmene — sačuvaj ih pre prelaska na drugo poglavlje.' : 'Sve izmene su sačuvane.'}</p>
    <div className="flex flex-wrap gap-2"><button disabled={busy || !dirty} className="rounded-full bg-primary px-5 py-2 text-sm text-white disabled:opacity-40">Sačuvaj poglavlje</button><button type="button" onClick={() => { if (!dirty || window.confirm('Napustiti izmene koje još nisu sačuvane?')) onDone() }} className="rounded-full border bg-white px-5 py-2 text-sm">Vrati se čitanju</button></div>
  </form>
}
