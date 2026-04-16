// src/lib/api.js — fetch wrapper with access-token injection & auto-refresh

const BASE = import.meta.env.VITE_API_BASE_URL || ''

let accessToken = null
let refreshing = null

export function setAccessToken(t) {
  accessToken = t
}

export function getAccessToken() {
  return accessToken
}

async function doRefresh() {
  const res = await fetch(`${BASE}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
  if (!res.ok) throw new Error('REFRESH_FAILED')
  const data = await res.json()
  accessToken = data.accessToken
  return data
}

export async function api(path, { method = 'GET', body, headers = {}, auth = true, retry = true } = {}) {
  const init = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }
  if (auth && accessToken) init.headers.Authorization = `Bearer ${accessToken}`
  if (body !== undefined) init.body = typeof body === 'string' ? body : JSON.stringify(body)

  const url = path.startsWith('http') ? path : `${BASE}${path}`
  const res = await fetch(url, init)

  if (res.status === 401 && retry && auth) {
    try {
      if (!refreshing) refreshing = doRefresh().finally(() => { refreshing = null })
      await refreshing
      return api(path, { method, body, headers, auth, retry: false })
    } catch {
      accessToken = null
      const err = new Error('UNAUTHENTICATED')
      err.status = 401
      throw err
    }
  }

  const text = await res.text()
  const data = text ? safeParse(text) : null

  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP_${res.status}`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

function safeParse(t) {
  try { return JSON.parse(t) } catch { return { raw: t } }
}

export const authApi = {
  login: (email, password, expectedRole) =>
    api('/api/auth/login', { method: 'POST', body: { email, password, expectedRole }, auth: false }),
  signupCreator: (payload) =>
    api('/api/auth/signup/creator', { method: 'POST', body: payload, auth: false }),
  signupBusiness: (payload) =>
    api('/api/auth/signup/business', { method: 'POST', body: payload, auth: false }),
  logout: () => api('/api/auth/logout', { method: 'POST', auth: false }),
  me: () => api('/api/me'),
  refresh: doRefresh,
}
