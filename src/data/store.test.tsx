import { act, renderHook, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
const api = vi.hoisted(() => ({
  read: vi.fn(async () => ({ memories: {}, comments: [], albums: [], drafts: [], stageSettings: {} })),
  write: vi.fn(async () => ({ saved: true })),
}))
vi.mock('./story.functions', () => ({ readStory: api.read, writeStory: api.write }))
import { actions, useStore } from './store'

it('imports browser data once and keeps failed edits queued for retry', async () => {
  localStorage.setItem('david-anci-store-v1', JSON.stringify({ comments: [{ id: 'old', photoId: 'photo', author: 'Anči', body: 'Naša uspomena', at: '2026-01-01' }] }))
  const { result, unmount } = renderHook(() => useStore())
  await waitFor(() => expect(result.current.ready).toBe(true))
  expect(api.write).toHaveBeenCalledWith({ data: { importing: true, changes: [expect.objectContaining({ collection: 'comments', id: 'old' })] } })
  expect(localStorage.getItem('david-anci-store-v1-imported')).toBe('yes')
  expect(localStorage.getItem('david-anci-store-v1')).toContain('Naša uspomena')
  expect(result.current.drafts.find((d) => d.id === 'original-1')!.body.length).toBeGreaterThan(1000)

  await act(async () => { await actions.updateAlbum('omiljene', 'Naši mali trenuci', 'photo-2') })
  expect(result.current.albums[0].title).toBe('Naši mali trenuci')
  expect(api.write).toHaveBeenLastCalledWith({ data: { changes: [expect.objectContaining({ collection: 'albums', id: 'omiljene', value: expect.objectContaining({ coverPhotoId: 'photo-2', title: 'Naši mali trenuci' }) })] } })

  api.write.mockRejectedValueOnce(new Error('offline'))
  await act(async () => { await actions.editDraft('original-1', { title: 'Naš početak', body: 'Dorađena priča.', stage: 'Mart' }) })
  expect(result.current.error).toContain('nisu sačuvane')
  expect(result.current.drafts.find((d) => d.id === 'original-1')?.body).toBe('Dorađena priča.')
  await act(async () => { await actions.retrySync() })
  expect(result.current.error).toBeNull()
  expect(api.write).toHaveBeenLastCalledWith({ data: { changes: [expect.objectContaining({ collection: 'drafts', id: 'original-1' })] } })
  unmount()
})
