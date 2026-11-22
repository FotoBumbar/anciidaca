import { useSyncExternalStore } from 'react'
import { nextChapters, chapters } from './book'
import originalChapters from './book-chapters.json'
import { readStory, writeStory } from './story.functions'

export type Author = 'David' | 'Anči'
export type Memory = { title: string; note: string; author: Author; updatedAt: string }
export type Comment = { id: string; photoId: string; author: Author; body: string; at: string }
export type Album = { id: string; title: string; emoji: string; photoIds: string[]; createdAt: string; coverPhotoId?: string }
export type Draft = { id: string; title: string; emoji: string; body: string; author: Author; updatedAt: string; stage?: string }

type State = {
  me: Author
  ready: boolean
  saving: boolean
  error: string | null
  stageSettings: Record<string, { title: string; coverPhotoId?: string }>
  memories: Record<string, Memory>
  comments: Comment[]
  albums: Album[]
  drafts: Draft[]
}

const KEY = 'david-anci-store-v1'
const now = () => new Date().toISOString()
const uid = () => Math.random().toString(36).slice(2, 10)

const seed: State = {
  me: 'David',
  ready: false, saving: false, error: null, stageSettings: {},
  memories: {},
  comments: [],
  albums: [
    { id: 'omiljene', title: 'Naše omiljene', emoji: '💞', photoIds: [], createdAt: '2026-11-21T00:00:00.000Z' },
  ],
  drafts: [...originalChapters.map((c, i) => ({ ...c, title: i ? chapters[i - 1].title : 'Uvodna stranica', author: 'David' as Author, updatedAt: '' })), ...nextChapters.map((c) => ({ id: c.id, title: c.title, emoji: c.emoji, stage: c.title, body: '', author: 'David' as Author, updatedAt: '' }))],
}

let state: State = seed
let loaded = false
const listeners = new Set<() => void>()

type Collection = 'memories' | 'comments' | 'albums' | 'drafts' | 'stageSettings'
type Change = { collection: Collection; id: string; value: unknown }
const collections: Collection[] = ['memories', 'comments', 'albums', 'drafts', 'stageSettings']
const pending: Change[] = []
let flushing: Promise<void> | null = null
const emit = () => listeners.forEach((l) => l())
function rows(s: Partial<State>, key: Collection): Record<string, unknown> {
  const value = s[key]
  return Array.isArray(value) ? Object.fromEntries(value.map((r) => [r.id, r])) : value ?? {}
}
async function refresh() {
  if (pending.length || flushing) return
  const remote = await readStory()
  if (pending.length || flushing) return
  state = { ...state, ...remote, ready: true, error: null,
    albums: remote.albums.length ? remote.albums : seed.albums,
    drafts: [...seed.drafts.map((d) => remote.drafts.find((r) => r.id === d.id) ?? d), ...remote.drafts.filter((d) => !seed.drafts.some((s) => s.id === d.id))],
  }
  emit()
}
async function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try {
    const me = localStorage.getItem('david-anci-author')
    if (me === 'David' || me === 'Anči') state = { ...state, me }
    const raw = localStorage.getItem(KEY)
    if (raw && !localStorage.getItem(KEY + '-imported')) {
      const legacy = JSON.parse(raw) as Partial<State>
      const changes = collections.flatMap((collection) => Object.entries(rows(legacy, collection)).map(([id, value]) => ({ collection, id, value })))
      if (changes.length) await writeStory({ data: { changes, importing: true } })
      localStorage.setItem(KEY + '-imported', 'yes')
    }
    await refresh()
  } catch {
    state = { ...state, error: 'Ne možemo da učitamo zajedničke uspomene. Proveri vezu i pokušaj ponovo.' }
    loaded = false
    emit()
  }
}
function flush(): Promise<void> {
  if (flushing) return flushing
  flushing = (async () => {
    state = { ...state, saving: true, error: null }; emit()
    try {
      while (pending.length) {
        const batch = pending.slice(0, 100)
        await writeStory({ data: { changes: batch } })
        pending.splice(0, batch.length)
      }
    } catch {
      state = { ...state, error: 'Izmene još nisu sačuvane. Ostani na stranici i pokušaj ponovo.' }
    } finally {
      flushing = null
      state = { ...state, saving: false }; emit()
    }
  })()
  return flushing
}
function set(update: (s: State) => State) {
  if (!state.ready) return Promise.resolve()
  const previous = state
  state = update(state)
  for (const collection of collections) {
    const before = rows(previous, collection), after = rows(state, collection)
    for (const id of new Set([...Object.keys(before), ...Object.keys(after)])) {
      if (JSON.stringify(before[id]) !== JSON.stringify(after[id])) pending.push({ collection, id, value: after[id] ?? null })
    }
  }
  emit()
  return flush()
}
function subscribe(l: () => void) {
  listeners.add(l)
  void load()
  const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh().catch(() => {}) }, 30000)
  return () => { listeners.delete(l); clearInterval(timer) }
}

export function useStore() {
  return useSyncExternalStore(subscribe, () => state, () => seed)
}

export const actions = {
  setMe: (me: Author) => { state = { ...state, me }; try { localStorage.setItem('david-anci-author', me) } catch { /* optional preference */ } emit() },
  retrySync: () => pending.length ? flush() : (loaded = false, load()),
  updateAlbum: (id: string, title: string, coverPhotoId?: string) => set((s) => ({ ...s, albums: s.albums.map((a) => a.id === id ? { ...a, title, coverPhotoId } : a) })),
  updateStage: (id: string, title: string, coverPhotoId?: string) => set((s) => ({ ...s, stageSettings: { ...s.stageSettings, [id]: { title, coverPhotoId } } })),
  editDraft: (id: string, patch: { title: string; body: string; stage: string }) => set((s) => ({ ...s, drafts: s.drafts.map((d) => d.id === id ? { ...d, ...patch, author: s.me, updatedAt: now() } : d) })),
  saveMemory: (photoId: string, title: string, note: string) =>
    set((s) => ({ ...s, memories: { ...s.memories, [photoId]: { title, note, author: s.me, updatedAt: now() } } })),
  addComment: (photoId: string, body: string) =>
    set((s) => ({ ...s, comments: [...s.comments, { id: uid(), photoId, author: s.me, body, at: now() }] })),
  deleteComment: (id: string) => set((s) => ({ ...s, comments: s.comments.filter((c) => c.id !== id) })),
  createAlbum: (title: string, emoji: string) => {
    const id = uid()
    set((s) => ({ ...s, albums: [...s.albums, { id, title, emoji, photoIds: [], createdAt: now() }] }))
    return id
  },
  deleteAlbum: (id: string) => set((s) => ({ ...s, albums: s.albums.filter((a) => a.id !== id) })),
  toggleInAlbum: (albumId: string, photoId: string) =>
    set((s) => ({
      ...s,
      albums: s.albums.map((a) =>
        a.id !== albumId
          ? a
          : { ...a, photoIds: a.photoIds.includes(photoId) ? a.photoIds.filter((p) => p !== photoId) : [...a.photoIds, photoId] },
      ),
    })),
  saveDraft: (id: string, body: string) =>
    set((s) => ({ ...s, drafts: s.drafts.map((d) => (d.id === id ? { ...d, body, author: s.me, updatedAt: now() } : d)) })),
  addDraft: (title: string) => {
    const id = uid()
    set((s) => ({ ...s, drafts: [...s.drafts, { id, title, emoji: '✍️', body: '', author: s.me, updatedAt: now() }] }))
    return id
  },
  deleteDraft: (id: string) => set((s) => ({ ...s, drafts: s.drafts.filter((d) => d.id !== id) })),
}

/** Public share links carry the album inside the URL, so they open on any phone without a login. */
export function shareLink(title: string, photoIds: string[]) {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ t: title, p: photoIds }))))
  return `${window.location.origin}/podeli?a=${encodeURIComponent(payload)}`
}

export function readShare(a: string): { t: string; p: string[] } | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(a))))
  } catch {
    return null
  }
}
