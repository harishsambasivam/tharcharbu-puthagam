import { z } from 'zod'
import { text } from '../core/schema.js'
import { KINDS } from '../core/links.js'

// The written text, stored once per language like the other models. `body` is Markdown, like `article` on the other models.
export const ArticleText = z.object({
  title: text(160),
  summary: text(600),
  body: text(40000),
  photos: z.array(z.object({ label: text(40), caption: text(120) })).max(12).default([]),
})

// The first photo is the cover. `items` are the plants, trees and creatures the article is about; unlike links,
// they live on the article only.
export const ArticleModel = z.object({
  photos: z.array(z.object({ key: text(300), hint: text(120) })).max(12).default([]),
  items: z
    .array(z.object({ kind: z.enum(KINDS), id: z.string().min(1).max(40) }))
    .max(40)
    .default([]),
  en: ArticleText.default({}),
  ta: ArticleText.default({}),
})

export const ArticlePublishModel = ArticleModel.extend({
  en: ArticleText.extend({ title: z.string().trim().min(1, 'Title is required').max(160) }).default({}),
})
