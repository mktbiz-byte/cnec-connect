import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/auth.js'
import creatorsRoutes from './routes/creators.js'
import campaignsRoutes from './routes/campaigns.js'
import applicationsRoutes from './routes/applications.js'
import meRoutes from './routes/me.js'
import threadsRoutes from './routes/threads.js'
import paymentsRoutes from './routes/payments.js'
import contentRoutes from './routes/content.js'
import notificationsRoutes from './routes/notifications.js'
import adminRoutes from './routes/admin.js'
import discoveryRoutes from './routes/discovery.js'

const app = express()

const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (origins.includes('*') || origins.includes(origin)) return cb(null, true)
      return cb(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))
app.get('/', (_req, res) => res.json({ service: 'cnec-connect-api', status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/me', meRoutes)
app.use('/api/creators', creatorsRoutes)
app.use('/api/campaigns', campaignsRoutes)
app.use('/api/applications', applicationsRoutes)
app.use('/api/threads', threadsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/discovery', discoveryRoutes)

app.use((err, _req, res, _next) => {
  console.error('[api] unhandled error:', err)
  res.status(err.status || 500).json({ error: err.code || 'INTERNAL_ERROR', message: err.message })
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`[api] listening on :${port}`)
})
