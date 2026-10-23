import { z } from 'zod'
import { base, baseText, bilingual, group, lifeCycle, named, role, text } from '../core/schema.js'

const NOTES = ['description', 'habitat', 'behaviour', 'onCrops', 'signs', 'management']

export const AnimalText = baseText.extend({
  group: text(40),
  diet: text(40),
  toPeople: text(40),
  body: group(['class', 'size', 'colour', 'lifespan']),
  habits: group(['livesIn', 'feedsOn', 'activeAt', 'social']),
  lifeCycle,
  notes: group(NOTES, 2000),
})

export const AnimalModel = bilingual(base.extend({ role }), AnimalText)

export const AnimalPublishModel = named(AnimalModel).extend({
  role: z.enum(['Pest', 'Beneficial'], { message: 'Pick Pest or Beneficial' }),
})
