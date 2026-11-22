// @vitest-environment node
import { expect, it } from 'vitest'
import { narrationParts } from './narration'

it('keeps all words in bounded parts and ignores empty chapters', () => {
  const body = Array.from({ length: 1500 }, (_, i) => `reč${i}`).join(' ')
  const parts = narrationParts('Naša priča', body)
  expect(parts.length).toBeGreaterThan(1)
  expect(parts.every((p) => p.length <= 2400)).toBe(true)
  expect(parts.join(' ').replace(/\s+/g, ' ')).toBe(`Naša priča. ${body}`)
  expect(narrationParts('Prazna strana', '  ')).toEqual([])
})
