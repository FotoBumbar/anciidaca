import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const author = z.enum(['David', 'Anči'])
const id = z.string().min(1).max(200)
const short = z.string().max(300)
const schemas = {
  memories: z.object({ title: short, note: z.string().max(50000), author, updatedAt: short }),
  comments: z.object({ id, photoId: id, author, body: z.string().max(10000), at: short }),
  albums: z.object({ id, title: short, emoji: short, photoIds: z.array(id).max(5000), createdAt: short, coverPhotoId: id.optional() }),
  drafts: z.object({ id, title: short, emoji: short, body: z.string().max(200000), author, updatedAt: short, stage: short.optional() }),
  stageSettings: z.object({ title: short, coverPhotoId: id.optional() }),
}
const change = z.object({ collection: z.enum(['memories', 'comments', 'albums', 'drafts', 'stageSettings']), id, value: z.unknown() }).transform((v) => ({ ...v, value: v.value === null ? null : schemas[v.collection].parse(v.value) }))

export const readStory = createServerFn({ method: 'GET' }).handler(async () => {
  const { db } = await import('../../db/index')
  const schema = await import('../../db/schema')
  const [memories, comments, albums, drafts, stageSettings] = await Promise.all([
    db.select().from(schema.memories), db.select().from(schema.comments), db.select().from(schema.albums), db.select().from(schema.bookChapters), db.select().from(schema.stages),
  ])
  return {
    memories: Object.fromEntries(memories.map((r) => [r.id, schemas.memories.parse(r.value)])),
    comments: comments.map((r) => schemas.comments.parse(r.value)),
    albums: albums.map((r) => schemas.albums.parse(r.value)),
    drafts: drafts.map((r) => schemas.drafts.parse(r.value)),
    stageSettings: Object.fromEntries(stageSettings.map((r) => [r.id, schemas.stageSettings.parse(r.value)])),
  }
})

export const writeStory = createServerFn({ method: 'POST' })
  .validator(z.object({ changes: z.array(change).max(5000), importing: z.boolean().optional() }))
  .handler(async ({ data }) => {
    const { db } = await import('../../db/index')
    const schema = await import('../../db/schema')
    const { eq } = await import('drizzle-orm')
    const tables = { memories: schema.memories, comments: schema.comments, albums: schema.albums, drafts: schema.bookChapters, stageSettings: schema.stages }
    for (const item of data.changes) {
      const table = tables[item.collection]
      if (item.value === null) {
        if (!data.importing) await db.delete(table).where(eq(table.id, item.id))
      } else if (data.importing) {
        await db.insert(table).values({ id: item.id, value: item.value }).onConflictDoNothing()
      } else {
        await db.insert(table).values({ id: item.id, value: item.value }).onConflictDoUpdate({ target: table.id, set: { value: item.value } })
      }
    }
    return { saved: true }
  })
