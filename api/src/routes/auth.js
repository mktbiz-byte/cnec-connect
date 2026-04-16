import { Router } from 'express'
import { z } from 'zod'
import { query, withTx } from '../db.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { signAccess, signRefresh, verifyRefresh } from '../lib/jwt.js'

const router = Router()

const REFRESH_COOKIE = 'cnec_refresh'
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SECURE === 'true' ? 'none' : 'lax',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/api/auth',
    domain: process.env.COOKIE_DOMAIN || undefined,
  })
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' })
}

function issueTokens(res, user) {
  const payload = { sub: user.id, role: user.role, email: user.email }
  const accessToken = signAccess(payload)
  const refreshToken = signRefresh(payload)
  setRefreshCookie(res, refreshToken)
  return accessToken
}

const creatorSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  handle: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_.]+$/i, '영문/숫자/밑줄/마침표만 사용 가능합니다'),
  displayName: z.string().min(1).max(64),
  region: z.string().optional(),
  categories: z.array(z.string()).optional(),
})

router.post('/signup/creator', async (req, res, next) => {
  try {
    const body = creatorSignupSchema.parse(req.body)
    const exists = await query('SELECT 1 FROM users WHERE email = $1', [body.email.toLowerCase()])
    if (exists.rowCount > 0) return res.status(409).json({ error: 'EMAIL_TAKEN' })

    const handleTaken = await query('SELECT 1 FROM creator_profiles WHERE handle = $1', [body.handle])
    if (handleTaken.rowCount > 0) return res.status(409).json({ error: 'HANDLE_TAKEN' })

    const passwordHash = await hashPassword(body.password)

    const user = await withTx(async (client) => {
      const u = await client.query(
        `INSERT INTO users(email, password_hash, role) VALUES ($1, $2, 'creator')
         RETURNING id, email, role`,
        [body.email.toLowerCase(), passwordHash],
      )
      await client.query(
        `INSERT INTO creator_profiles(user_id, handle, display_name, region, categories)
         VALUES ($1, $2, $3, $4, $5)`,
        [u.rows[0].id, body.handle, body.displayName, body.region || null, body.categories || []],
      )
      return u.rows[0]
    })

    const accessToken = issueTokens(res, user)
    res.status(201).json({ accessToken, user: { id: user.id, email: user.email, role: user.role } })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

const businessSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  companyName: z.string().min(1).max(120),
  contactName: z.string().min(1).max(64),
  phone: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().optional(),
})

router.post('/signup/business', async (req, res, next) => {
  try {
    const body = businessSignupSchema.parse(req.body)
    const exists = await query('SELECT 1 FROM users WHERE email = $1', [body.email.toLowerCase()])
    if (exists.rowCount > 0) return res.status(409).json({ error: 'EMAIL_TAKEN' })

    const passwordHash = await hashPassword(body.password)

    const user = await withTx(async (client) => {
      const u = await client.query(
        `INSERT INTO users(email, password_hash, role) VALUES ($1, $2, 'business')
         RETURNING id, email, role`,
        [body.email.toLowerCase(), passwordHash],
      )
      await client.query(
        `INSERT INTO business_profiles(user_id, company_name, contact_name, phone, industry, website)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [u.rows[0].id, body.companyName, body.contactName, body.phone || null, body.industry || null, body.website || null],
      )
      return u.rows[0]
    })

    const accessToken = issueTokens(res, user)
    res.status(201).json({ accessToken, user: { id: user.id, email: user.email, role: user.role } })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  expectedRole: z.enum(['creator', 'business']).optional(),
})

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const { rows } = await query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [body.email.toLowerCase()],
    )
    if (rows.length === 0) return res.status(401).json({ error: 'INVALID_CREDENTIALS' })
    const user = rows[0]
    const ok = await verifyPassword(body.password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'INVALID_CREDENTIALS' })
    // admin 계정은 모든 로그인 페이지에서 입장 가능
    if (body.expectedRole && body.expectedRole !== user.role && user.role !== 'admin') {
      return res.status(403).json({ error: 'WRONG_ROLE', role: user.role })
    }
    const accessToken = issueTokens(res, user)
    res.json({ accessToken, user: { id: user.id, email: user.email, role: user.role } })
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'VALIDATION', details: err.errors })
    next(err)
  }
})

router.post('/refresh', async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE]
  if (!token) return res.status(401).json({ error: 'NO_REFRESH' })
  try {
    const payload = verifyRefresh(token)
    const { rows } = await query('SELECT id, email, role FROM users WHERE id = $1', [payload.sub])
    if (rows.length === 0) {
      clearRefreshCookie(res)
      return res.status(401).json({ error: 'USER_NOT_FOUND' })
    }
    const accessToken = issueTokens(res, rows[0])
    res.json({ accessToken, user: rows[0] })
  } catch {
    clearRefreshCookie(res)
    return res.status(401).json({ error: 'INVALID_REFRESH' })
  }
})

router.post('/logout', (_req, res) => {
  clearRefreshCookie(res)
  res.json({ ok: true })
})

export default router
