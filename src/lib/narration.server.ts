import { createHash } from 'node:crypto'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { getStore } from '@netlify/blobs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db/index'
import { bookChapters } from '../../db/schema'
import originalChapters from '@/data/book-chapters.json'
import { chapters } from '@/data/book'
import { narrationParts } from './narration'

const input = z.object({ chapterId: z.string().min(1).max(200), part: z.number().int().min(0).max(200) })
const chapter = z.object({ title: z.string().max(300), body: z.string().max(200000) })
const voice = 'EXAVITQu4vr4xnSDxMaL'
const model = 'eleven_v3' // Supports Serbian (sr); multilingual_v2 does not.
const error = (message: string, status: number) => Response.json({ error: message }, { status, headers: { 'Cache-Control': 'no-store' } })

export async function handleNarration(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) return error('Ovaj zahtev nije dozvoljen.', 403)
  let raw: string
  try { raw = await request.text() } catch { return error('Zahtev nije ispravan.', 400) }
  if (raw.length > 1000) return error('Zahtev je prevelik.', 413)
  let data: z.infer<typeof input>
  try { data = input.parse(JSON.parse(raw)) } catch { return error('Izaberi poglavlje i deo za čitanje.', 400) }

  try {
    // Read only saved book text; the endpoint never accepts arbitrary synthesis prompts.
    const [saved] = await db.select().from(bookChapters).where(eq(bookChapters.id, data.chapterId)).limit(1)
    const originalIndex = originalChapters.findIndex((c) => c.id === data.chapterId)
    const original = originalChapters[originalIndex]
    const content = saved ? chapter.parse(saved.value) : original ? { ...original, title: originalIndex ? chapters[originalIndex - 1].title : 'Uvodna stranica' } : null
    if (!content) return error('Ovo poglavlje ne postoji.', 404)
    const text = narrationParts(content.title, content.body)[data.part]
    if (!text) return error('Ova strana još nema tekst za čitanje.', 404)

    const cache = getStore({ name: 'book-narration', consistency: 'strong' })
    const key = createHash('sha256').update(JSON.stringify({ text, voice, model, language: 'sr' })).digest('hex') + '.mp3'
    let audio = await cache.get(key, { type: 'arrayBuffer' })
    if (!audio) {
      if (!process.env.ELEVENLABS_API_KEY) return error('AI glas još nije podešen. Možeš da koristiš glas uređaja.', 503)
      const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY })
      const stream = await elevenlabs.textToSpeech.convert(voice, {
        text, modelId: model, languageCode: 'sr', outputFormat: 'mp3_44100_128',
      }, { timeoutInSeconds: 50, maxRetries: 0 })
      audio = await new Response(stream).arrayBuffer()
      if (!audio.byteLength || audio.byteLength > 15000000) return error('Snimak nije uspeo. Pokušaj ponovo.', 502)
      await cache.set(key, audio)
    }
    return new Response(audio, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } })
  } catch {
    return error('AI glas trenutno nije dostupan. Pokušaj ponovo ili izaberi glas uređaja.', 503)
  }
}
