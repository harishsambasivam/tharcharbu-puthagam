import { z } from 'zod'

const blankGroup = (fields) => Object.fromEntries(fields.map((f) => [f.key, '']))
const textStats = (cfg) => cfg.stats.filter((s) => !s.options && !s.range)

// One language's text document, mirroring the `*Text` schemas in the backend models. Stored as `en` and `ta`.
const blankText = (cfg) => ({
  ...Object.fromEntries(textStats(cfg).map((s) => [s.key, ''])),
  ...Object.fromEntries(cfg.traits.map((t) => [t.key, blankGroup(t.fields)])),
  notes: blankGroup(cfg.notes),
  article: '',
  photos: [],
  ...(cfg.lifeCycle && { group: '', lifeCycle: [] }),
})
export const blankStage = () => ({ stage: '', duration: '', text: '' })
export const blankCaption = () => ({ label: '', caption: '' })

// The empty shape of an item for this section, mirroring the backend model.
export function blankFor(cfg) {
  return {
    name: '',
    scientific: '',
    family: '',
    names: { en: '', ta: '', te: '', teLatin: '', kn: '', knLatin: '', ml: '', mlLatin: '' },
    tamilNames: [],
    seasons: [],
    lands: [],
    photos: [],
    ...Object.fromEntries(cfg.stats.filter((s) => s.options).map((s) => [s.key, ''])),
    ...Object.fromEntries(cfg.stats.filter((s) => s.range).map((s) => [s.key, { min: null, max: null }])),
    tags: {},
    en: blankText(cfg),
    ta: blankText(cfg),
  }
}

export function toForm(cfg, item = {}) {
  const blank = blankFor(cfg)
  return Object.fromEntries(
    Object.entries(blank).map(([k, v]) => [k, v && typeof v === 'object' && !Array.isArray(v) ? { ...v, ...item[k] } : (item[k] ?? v)]),
  )
}

// Checked when publishing; drafts can be saved half-filled.
export const publishSchema = (cfg) =>
  z
    .object({
      name: z.string().trim().min(1, 'Add the name in English letters'),
      scientific: z.string().trim().min(1, 'Add the scientific name'),
      en: z
        .object({ photos: z.array(z.object({ caption: z.string().trim().min(1, 'Add a caption') }).passthrough()) })
        .passthrough(),
      ...(cfg.flora
        ? { names: z.object({ ta: z.string().trim().min(1, 'Add the Tamil name') }).passthrough() }
        : { role: z.enum(['Pest', 'Beneficial'], { errorMap: () => ({ message: 'Pick Pest or Beneficial' }) }) }),
    })
    .passthrough()
