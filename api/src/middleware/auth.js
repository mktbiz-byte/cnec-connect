import { verifyAccess } from '../lib/jwt.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'UNAUTHENTICATED' })
  try {
    const payload = verifyAccess(token)
    req.user = { id: payload.sub, role: payload.role, email: payload.email }
    next()
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN' })
  }
}

export function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'UNAUTHENTICATED' })
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'FORBIDDEN' })
    next()
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next()
  try {
    const payload = verifyAccess(token)
    req.user = { id: payload.sub, role: payload.role, email: payload.email }
  } catch {
    /* ignore */
  }
  next()
}
