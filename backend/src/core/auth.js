import crypto from 'node:crypto'
import { HttpError } from './http.js'

const TOKEN_DAYS = 7
const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set')
  return process.env.JWT_SECRET
}
const sign = (body) => crypto.createHmac('sha256', secret()).update(body).digest('base64url')
const sameBytes = (a, b) => a.length === b.length && crypto.timingSafeEqual(a, b)

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`
}

export function checkPassword(password) {
  const [salt, hash] = (process.env.ADMIN_PASSWORD_HASH || '').split(':')
  if (!salt || !hash || typeof password !== 'string') return false
  return sameBytes(crypto.scryptSync(password, salt, 64), Buffer.from(hash, 'hex'))
}

export function issueToken() {
  const body = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + TOKEN_DAYS * 864e5 })).toString('base64url')
  return `${body}.${sign(body)}`
}

export function verifyToken(token) {
  const [body, sig] = String(token || '').split('.')
  if (!body || !sig || !sameBytes(Buffer.from(sig), Buffer.from(sign(body)))) return false
  try {
    return JSON.parse(Buffer.from(body, 'base64url')).exp > Date.now()
  } catch {
    return false
  }
}

export const attachAdmin = (req, _res, next) => {
  req.admin = verifyToken(req.get('x-auth-token'))
  next()
}

export const requireAdmin = (req, _res, next) => next(req.admin ? undefined : new HttpError(401, 'Editors only'))
