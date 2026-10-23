import { ZodError } from 'zod'

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) return res.status(400).json({ error: 'Invalid data', issues: err.issues })
  if (err.status) return res.status(err.status).json({ error: err.message })
  console.error(err)
  res.status(500).json({ error: 'Something went wrong' })
}
