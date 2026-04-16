import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, setAccessToken } from '@/lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('loading') // loading | authed | anonymous

  const bootstrap = useCallback(async () => {
    try {
      await authApi.refresh()
      const { user, profile } = await authApi.me()
      setUser(user)
      setProfile(profile)
      setStatus('authed')
    } catch {
      setUser(null)
      setProfile(null)
      setStatus('anonymous')
    }
  }, [])

  useEffect(() => { bootstrap() }, [bootstrap])

  const login = useCallback(async (email, password, expectedRole) => {
    const { accessToken, user } = await authApi.login(email, password, expectedRole)
    setAccessToken(accessToken)
    setUser(user)
    const me = await authApi.me().catch(() => ({ profile: null }))
    setProfile(me.profile || null)
    setStatus('authed')
    return user
  }, [])

  const signupCreator = useCallback(async (payload) => {
    const { accessToken, user } = await authApi.signupCreator(payload)
    setAccessToken(accessToken)
    setUser(user)
    const me = await authApi.me().catch(() => ({ profile: null }))
    setProfile(me.profile || null)
    setStatus('authed')
    return user
  }, [])

  const signupBusiness = useCallback(async (payload) => {
    const { accessToken, user } = await authApi.signupBusiness(payload)
    setAccessToken(accessToken)
    setUser(user)
    const me = await authApi.me().catch(() => ({ profile: null }))
    setProfile(me.profile || null)
    setStatus('authed')
    return user
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    setAccessToken(null)
    setUser(null)
    setProfile(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(
    () => ({ user, profile, status, login, signupCreator, signupBusiness, logout, refresh: bootstrap }),
    [user, profile, status, login, signupCreator, signupBusiness, logout, bootstrap],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
