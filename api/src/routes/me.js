import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const u = await query('SELECT id, email, role, created_at FROM users WHERE id = $1', [req.user.id])
    if (u.rowCount === 0) return res.status(404).json({ error: 'NOT_FOUND' })
    const user = u.rows[0]

    let profile = null
    if (user.role === 'creator') {
      const p = await query('SELECT * FROM creator_profiles WHERE user_id = $1', [user.id])
      profile = p.rows[0] || null
    } else if (user.role === 'business') {
      const p = await query('SELECT * FROM business_profiles WHERE user_id = $1', [user.id])
      profile = p.rows[0] || null
    }

    res.json({ user, profile })
  } catch (err) {
    next(err)
  }
})

export default router
