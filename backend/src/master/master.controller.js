import { Router } from 'express'
import { requireAdmin } from '../core/auth.js'
import { getLists, saveList } from '../core/master.js'

const r = Router()

r.get('/', async (_req, res) => res.json(await getLists()))

r.use(requireAdmin)
r.put('/:key', async (req, res) => res.json(await saveList(req.params.key, req.body?.options)))

export default r
