// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
const mock = vi.hoisted(() => ({ rows: [] as { value: { title: string; body: string } }[], get: vi.fn(), set: vi.fn(), convert: vi.fn() }))
vi.mock('../../db/index', () => ({ db: { select: () => ({ from: () => ({ where: () => ({ limit: async () => mock.rows }) }) }) } }))
vi.mock('@netlify/blobs', () => ({ getStore: () => ({ get: mock.get, set: mock.set }) }))
vi.mock('@elevenlabs/elevenlabs-js', () => ({ ElevenLabsClient: class { textToSpeech = { convert: mock.convert } } }))
import { handleNarration } from './narration.server'
const request = (body: unknown) => new Request('https://example.com/api/naracija', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
beforeEach(() => {
  vi.clearAllMocks(); vi.unstubAllEnvs(); mock.rows = []; mock.get.mockResolvedValue(null); mock.set.mockResolvedValue(undefined)
})
it('rejects malformed requests before generation', async () => {
  expect((await handleNarration(request({ text: 'arbitrary prompt' }))).status).toBe(400)
  expect((await handleNarration(request({ chapterId: 'original-1', part: -1 }))).status).toBe(400)
  expect(mock.convert).not.toHaveBeenCalled()
})
it('replays saved audio without another provider request', async () => {
  mock.get.mockResolvedValue(new Uint8Array([73, 68, 51]).buffer)
  const response = await handleNarration(request({ chapterId: 'original-1', part: 0 }))
  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('audio/mpeg')
  expect(mock.convert).not.toHaveBeenCalled()
})
it('uses Serbian synthesis for saved text and changes the cache key after an edit', async () => {
  vi.stubEnv('ELEVENLABS_API_KEY', 'test-only-placeholder')
  mock.rows = [{ value: { title: 'Naš dan', body: 'Ovo smo napisali zajedno.' } }]
  mock.convert.mockImplementation(async () => new ReadableStream({ start(c) { c.enqueue(new Uint8Array([73, 68, 51])); c.close() } }))
  const first = await handleNarration(request({ chapterId: 'custom', part: 0 }))
  expect(first.status).toBe(200)
  expect(mock.convert).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ modelId: 'eleven_v3', languageCode: 'sr', text: 'Naš dan.\nOvo smo napisali zajedno.' }), expect.any(Object))
  const firstKey = mock.set.mock.calls[0][0]
  mock.rows[0].value.body = 'Naš novi tekst.'
  expect((await handleNarration(request({ chapterId: 'custom', part: 0 }))).status).toBe(200)
  expect(mock.set.mock.calls[1][0]).not.toBe(firstKey)
})
it('returns a safe message when synthesis is not configured', async () => {
  vi.stubEnv('ELEVENLABS_API_KEY', '')
  const response = await handleNarration(request({ chapterId: 'original-1', part: 0 }))
  expect(response.status).toBe(503)
  expect(mock.convert).not.toHaveBeenCalled()
})
