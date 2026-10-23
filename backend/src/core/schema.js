import { z } from 'zod'

// Building blocks shared by the five category models.
export const SEASONS = ['ilavenil', 'mudhuvenil', 'kaar', 'koothir', 'munpani', 'pinpani']
export const LANDS = ['kurinji', 'mullai', 'marutham', 'neithal', 'paalai']

export const text = (max = 200) => z.string().trim().max(max).default('')
export const group = (keys, max) => z.object(Object.fromEntries(keys.map((k) => [k, text(max)]))).default({})

// A span of whole days, e.g. 60–80. Either end may be left empty; numbers so the list can filter on them.
const days = z.number().int().min(0).max(3650).nullable().default(null)
export const dayRange = z
  .object({ min: days, max: days })
  .refine((r) => r.min === null || r.max === null || r.min <= r.max, { message: 'From must not be more than to', path: ['max'] })
  .default({})

// Fields that read the same in every language: names, classification, seasons, lands, photo files.
export const base = z.object({
  name: text(80),
  scientific: text(120),
  family: text(80),
  names: group(['en', 'ta', 'te', 'teLatin', 'kn', 'knLatin', 'ml', 'mlLatin'], 120),
  tamilNames: z.array(z.object({ ta: text(80), latin: text(80) })).max(20).default([]),
  seasons: z.array(z.enum(SEASONS)).default([]),
  lands: z.array(z.enum(LANDS)).default([]),
  photos: z.array(z.object({ key: text(300), hint: text(120) })).max(12).default([]),
  // Master-list choices per trait row, e.g. { 'grow.sunlight': ['full-sun', 'part-shade'] }. See core/master.js.
  tags: z.record(z.string().regex(/^[a-z]+\.[a-zA-Z]+$/), z.array(z.string().regex(/^[a-z0-9-]{1,40}$/)).max(20)).default({}),
})

// The written text, stored once per language. `photos` lines up with the shared photos by position.
// `article` is the long-form write-up; blank lines separate its paragraphs.
export const baseText = z.object({
  article: text(20000),
  photos: z.array(z.object({ label: text(40), caption: text(120) })).max(12).default([]),
})

// Every item is stored as its shared fields plus two separate text documents: `en` and `ta` (Tamil).
export const bilingual = (shared, content) => shared.extend({ en: content.default({}), ta: content.default({}) })

// Insects, birds and animals: numbered life-cycle stages.
export const lifeCycle = z
  .array(z.object({ stage: text(40), duration: text(40), text: text(300) }))
  .max(8)
  .default([])

export const role = z.enum(['', 'Pest', 'Beneficial']).default('')

const captioned = z.object({ label: text(40), caption: z.string().trim().min(1, 'Every photo needs a caption').max(120) })

export const named = (schema) =>
  schema.extend({
    name: z.string().trim().min(1, 'Name is required').max(80),
    scientific: z.string().trim().min(1, 'Scientific name is required').max(120),
    en: schema.shape.en.removeDefault().extend({ photos: z.array(captioned).max(12).default([]) }).default({}),
  })
