import { z } from 'zod'
import { base, baseText, bilingual, dayRange, group, named } from '../core/schema.js'

export const PlantText = baseText.extend({
    plant: group(['type', 'lifeCycle', 'habit', 'height']),
    grow: group(['sunlight', 'water', 'soil', 'spacing']),
    seed: group(['sowing', 'germinationTime', 'germinationRate', 'grownFrom']),
    leaf: group(['style', 'arrangement', 'foliage', 'thorn', 'length', 'width']),
    flower: group(['colour', 'aroma', 'size']),
    fruit: group(['colour', 'size', 'type']),
    notes: group(['description', 'habitat', 'landscape', 'propagation', 'harvesting', 'uses', 'medicinal', 'pests'], 2000),
})

export const PlantModel = bilingual(
  base.extend({
    harvest: dayRange,
    difficulty: z.enum(['', 'Easy', 'Medium', 'Hard']).default(''),
  }),
  PlantText,
)

export const PlantPublishModel = named(PlantModel).refine((p) => p.names.ta, {
  message: 'Tamil name is required',
  path: ['names', 'ta'],
})
