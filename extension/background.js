// CNEC Connect API base URL (사용자가 팝업에서 설정)
const DEFAULT_API = 'https://cnec-connect-production.up.railway.app'

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'LOOKUP') {
    chrome.storage.local.get(['apiBase', 'token'], async (s) => {
      const base = s.apiBase || DEFAULT_API
      const token = s.token || ''
      try {
        const res = await fetch(`${base}/api/discovery/search?q=${encodeURIComponent(msg.handle)}&limit=1`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const data = await res.json()
        sendResponse({ ok: true, creator: data?.data?.[0] || null })
      } catch (e) {
        sendResponse({ ok: false, error: e.message })
      }
    })
    return true
  }
})
