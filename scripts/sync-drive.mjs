// Reads the shared Google Drive folder and writes src/data/drive-photos.json.
// Run: node scripts/sync-drive.mjs   (re-run whenever new photos are added to Drive)
import { writeFileSync } from 'node:fs'

const FOLDER_ID = '1ejWVhM7Qdm40ejMexc7kM-XoXSQ7GQJE'
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic']
const VIDEO_EXT = ['mp4', 'mov', '3gp', 'webm']

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')

function dateFromName(name) {
  const ymd = name.match(/(20\d{2})(\d{2})(\d{2})/)
  if (ymd) {
    const [, y, m, d] = ymd
    if (+m >= 1 && +m <= 12 && +d >= 1 && +d <= 31) return `${y}-${m}-${d}`
  }
  const ms = name.match(/(1[6-9]\d{11})/)
  if (ms) return new Date(Number(ms[1])).toISOString().slice(0, 10)
  return null
}

const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${FOLDER_ID}`, {
  headers: { 'User-Agent': 'Mozilla/5.0' },
})
const html = await res.text()
const re = /<div class="flip-entry" id="entry-([^"]+)"[\s\S]*?<div class="flip-entry-title">([^<]*)<\/div>/g
const items = []
for (const [, id, rawName] of html.matchAll(re)) {
  const name = decode(rawName)
  const ext = name.split('.').pop().toLowerCase()
  const kind = IMAGE_EXT.includes(ext) ? 'photo' : VIDEO_EXT.includes(ext) ? 'video' : null
  if (!kind) continue // RAW (.NEF) and other files the browser can't show
  items.push({ id, name, kind, date: dateFromName(name) })
}
items.sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999') || a.name.localeCompare(b.name))
writeFileSync(
  new URL('../src/data/drive-photos.json', import.meta.url),
  JSON.stringify({ syncedAt: new Date().toISOString().slice(0, 10), folderId: FOLDER_ID, items }) + '\n',
)
const photos = items.filter((i) => i.kind === 'photo').length
console.log(`Saved ${photos} photos and ${items.length - photos} videos.`)
