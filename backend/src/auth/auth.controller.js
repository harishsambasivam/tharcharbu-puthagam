import { Router } from 'express'
import { checkPassword, issueToken } from '../core/auth.js'

const r = Router()

r.post('/login', async (req, res) => {
  if (checkPassword(req.body?.password)) return res.json({ token: issueToken() })
  await new Promise((done) => setTimeout(done, 1000)) // slows down guessing
  res.status(401).json({ error: 'Wrong password' })
})

export default r
