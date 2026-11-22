import drive from './drive-photos.json'
import { quotes } from './book'

export type DriveItem = { id: string; name: string; kind: 'photo' | 'video'; date: string | null }

export const DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${drive.folderId}`
export const SYNCED_AT = drive.syncedAt
export const allItems = drive.items as DriveItem[]
export const photos = allItems.filter((i) => i.kind === 'photo')
export const videos = allItems.filter((i) => i.kind === 'video')

/** Drive thumbnail at a given width. Keeps the original aspect ratio — never cropped. */
export const photoUrl = (id: string, w = 800) => `https://lh3.googleusercontent.com/d/${id}=w${w}`
export const photoFallbackUrl = (id: string, w = 800) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`
export const downloadUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`
export const videoEmbedUrl = (id: string) => `https://drive.google.com/file/d/${id}/preview`

export const YOUTUBE_ID = 'nXLHlerdqQ4'
export const TOGETHER_SINCE = new Date('2026-03-27T01:14:00+01:00')

const MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar']

export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d}. ${MONTHS[m - 1]} ${y}.`
}

/** Dates that matter to us — photos from these days get a special badge. */
export const specialDays: Record<string, { label: string; emoji: string }> = {
  '03-20': { label: 'Dan kad sam se zaljubio', emoji: '🔌' },
  '03-24': { label: 'Potraga za minđušama', emoji: '💎' },
  '03-26': { label: 'Prvi izlazak, Kapitol', emoji: '🌳' },
  '03-27': { label: 'NAŠ DAN · 1:14h', emoji: '💘' },
  '04-01': { label: 'Tri za večnost', emoji: '💋' },
  '06-12': { label: 'Tvoja matura', emoji: '🎓' },
  '06-13': { label: 'Moj osamnaesti', emoji: '🎂' },
  '06-16': { label: 'Zbogom jednom domu', emoji: '🏠' },
  '07-31': { label: '31. jul', emoji: '🌙' },
  '08-31': { label: '31. avgust', emoji: '🌅' },
  '09-18': { label: '18. septembar', emoji: '🚐' },
}
export const specialDayFor = (date: string | null) => (date ? specialDays[date.slice(5)] : undefined)

const stageTitles: Record<string, { title: string; emoji: string; line: string }> = {
  '03': { title: 'Kako je sve počelo', emoji: '💘', line: 'Punjač, minđuše i jedno „Bih.“' },
  '04': { title: 'Tri za večnost', emoji: '💋', line: 'Klupice pored pozorišta i prvi poljubac.' },
  '05': { title: 'Klupica na Kraljevici', emoji: '🌳', line: 'Pitalice, magični ranac i Radio Mileva.' },
  '06': { title: 'Matura i zbogom domu', emoji: '🎓', line: 'Diploma, osamnaesti i povratak u Boljevac.' },
  '07': { title: 'Višnje i brbolazine', emoji: '🍒', line: 'Mi smo kraljevi neplaniranih obrta.' },
  '08': { title: 'Leto koje pamtimo', emoji: '☀️', line: 'Poslednji dani pre puta.' },
  '09': { title: 'Pred daljinu', emoji: '🚐', line: 'Svaki vikend, svaki kombi, svaki zagrljaj.' },
  '10': { title: 'Temišvar i daljina', emoji: '🌍', line: '150 kilometara nije kraj sveta.' },
  '11': { title: 'Jesen na daljinu', emoji: '🍂', line: 'Brojimo dane do sledećeg viđenja.' },
  '12': { title: 'Prva zajednička zima', emoji: '❄️', line: 'Ćebe, čaj i mi.' },
}

export type Stage = { key: string; title: string; subtitle: string; emoji: string; line: string; items: DriveItem[] }

/** Photos grouped into stages by month (newest stages can be added just by syncing Drive). */
export function buildStages(items: DriveItem[] = photos): Stage[] {
  const groups = new Map<string, DriveItem[]>()
  for (const p of items) {
    const key = p.date ? p.date.slice(0, 7) : 'bez-datuma'
    groups.set(key, [...(groups.get(key) ?? []), p])
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a === 'bez-datuma' ? 1 : b === 'bez-datuma' ? -1 : a.localeCompare(b)))
    .map(([key, list]) => {
      if (key === 'bez-datuma') {
        return { key, title: 'Uspomene bez datuma', subtitle: 'svaki trenutak', emoji: '✨', line: 'Neke slike nemaju datum, ali imaju nas.', items: list }
      }
      const [y, m] = key.split('-')
      const t = stageTitles[m] ?? { title: MONTHS[+m - 1], emoji: '💞', line: 'Još jedan mesec naše priče.' }
      return { key, title: t.title, subtitle: `${MONTHS[+m - 1]} ${y}.`, emoji: t.emoji, line: t.line, items: list }
    })
}

/** Small deterministic hash, so every photo always gets the same personality. */
function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

const EMOJIS = ['💞', '🐢', '🌹', '✨', '🍒', '📸', '💋', '🌙', '🥞', '🎭', '💌', '🌻', '🫶', '🎞️', '☀️', '🧸']
const TAPES = ['#db9ba8', '#f0d9bf', '#b7cbb1', '#e8c1c7']

/** Each photo has something of its own: an emoji, a line from the book, a tilt and a tape color. */
export function photoPersonality(id: string) {
  const h = hash(id)
  return {
    emoji: EMOJIS[h % EMOJIS.length],
    quote: quotes[(h >> 4) % quotes.length],
    tilt: ((h >> 8) % 7) - 3,
    tape: TAPES[(h >> 12) % TAPES.length],
  }
}

/** A few different shared photos each visit, so no single favorite takes over. */
export function randomPhotos(n: number, seed = Date.now()) {
  const pool = [...photos]
  let s = seed
  for (let i = pool.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, n)
}
