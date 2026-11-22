// Regenerate the editable text from the original book; preserves poems and every extracted line.
import fs from 'node:fs'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
const pdf = await getDocument({ data: new Uint8Array(fs.readFileSync('public/docs/knjiga-bez-tacke.pdf')), useSystemFonts: true }).promise
const pages = []
for (let i = 2; i <= 37; i++) {
  const content = await (await pdf.getPage(i)).getTextContent()
  pages.push(content.items.filter((x) => 'str' in x).map((x) => x.str + (x.hasEOL ? '\n' : ' ')).join('').trim())
}
const text = pages.join('\n\n')
const markers = [
  ['Uvodna stranica', 'Početak', '📖'], ['Kišni dan, samo obična proba ili ipak ne', 'Mart', '🌧️'],
  ['Sedam dana izoštravanja slike', 'Mart', '🔌'], ['IZ MRAČNE KOMORE:', 'Mart', '🎞️'],
  ['SCENA 3.5:', 'Mart', '🌳'], ['SCENA 4 , KULMINACIJA', 'Mart', '💘'], ['Naš mali pakt sa svetom', 'Mart', '🤫'],
  ['Tri za večnost (', 'April', '💋'], ['Pitalice kod škole', 'Proleće', '🎒'], ['Muzej naših blesavih poklona', 'Proleće', '🐢'],
  ['Zbogom   jednom', 'Jun', '🎓'], ['Brbolazine, višnje i naša', 'Jul', '🍒'], ['Put od 150 kilometara (', 'Daljina', '🚐'],
  ['Apartman 29/30 (', 'Naš dom', '🥞'], ['Pismo za jedno novo poglavlje', 'Daljina', '💌'], ['Epilog ili novi početak', 'Nastavljamo', '✍️'],
]
const starts = markers.map(([marker]) => { const start = text.indexOf(marker); if (start < 0) throw new Error(`Missing chapter: ${marker}`); return start })
const chapters = markers.map(([, stage, emoji], i) => {
  const body = text.slice(starts[i], starts[i + 1] ?? text.length).trim()
  return { id: i ? `original-${i}` : 'uvod', title: body.split('\n')[0].trim(), stage, emoji, body }
})
fs.writeFileSync('src/data/book-chapters.json', JSON.stringify(chapters, null, 2) + '\n')
console.log(`Extracted ${chapters.length} sections.`)
