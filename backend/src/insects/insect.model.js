import { z } from 'zod'
import { base, baseText, bilingual, group, lifeCycle, named, role, text } from '../core/schema.js'

const NOTES = ['description', 'habitat', 'behaviour', 'onCrops', 'signs', 'management']

export const InsectText = baseText.extend({
  group: text(40),
  eggToAdult: text(40),
  toPeople: text(40),
  body: group(['order', 'size', 'colour', 'wings']),
  habits: group(['livesIn', 'feedsOn', 'activeAt', 'social']),
  lifeCycle,
  notes: group(NOTES, 2000),
})

export const InsectModel = bilingual(base.extend({ role }), InsectText)

export const InsectPublishModel = named(InsectModel).extend({
  role: z.enum(['Pest', 'Beneficial'], { message: 'Pick Pest or Beneficial' }),
})
