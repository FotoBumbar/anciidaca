import { pgTable, text, jsonb } from 'drizzle-orm/pg-core'

export const memories = pgTable('memories', { id: text().primaryKey(), value: jsonb().notNull() })
export const comments = pgTable('comments', { id: text().primaryKey(), value: jsonb().notNull() })
export const albums = pgTable('albums', { id: text().primaryKey(), value: jsonb().notNull() })
export const bookChapters = pgTable('book_chapters', { id: text().primaryKey(), value: jsonb().notNull() })
export const stages = pgTable('stage_settings', { id: text().primaryKey(), value: jsonb().notNull() })
