import { z } from 'zod'
import { base, baseText, bilingual, group, named, text } from '../core/schema.js'

export const TreeText = baseText.extend({
    firstFruit: text(60),
    tree: group(['type', 'lifeCycle', 'habit', 'height']),
    grow: group(['planting', 'sunlight', 'water', 'soil', 'spacing']),
    seed: group(['germinationTime', 'germinationRate', 'grownFrom']),
    leaf: group(['style', 'arrangement', 'foliage', 'thorn', 'length', 'width']),
    flower: group(['colour', 'aroma', 'size']),
    fruit: group(['colour', 'size', 'type']),
    notes: group(['description', 'habitat', 'landscape', 'propagation', 'harvesting', 'uses', 'medicinal', 'pests'], 2000),
})

export const TreeModel = bilingual(
  base.extend({
    difficulty: z.enum(['', 'Easy', 'Medium', 'Hard']).default(''),
  }),
  TreeText,
)

export const TreePublishModel = named(TreeModel).refine((t) => t.names.ta, {
  message: 'Tamil name is required',
  path: ['names', 'ta'],
})
