import crypto from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
import { requireAdmin } from '../core/auth.js'
import { KINDS } from '../core/links.js'
import { presignUpload } from '../core/s3.js'

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }
const input = z.object({
  kind: z.enum(KINDS),
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  contentType: z.enum(Object.keys(TYPES)),
})

const r = Router()

r.post('/', requireAdmin, async (req, res) => {
  const { kind, id, contentType } = input.parse(req.body)
  const key = `media/${kind}/${id}/${crypto.randomUUID()}.${TYPES[contentType]}`
  res.json({ key, uploadUrl: await presignUpload(key, contentType) })
})

export default r
