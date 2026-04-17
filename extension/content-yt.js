// YouTube 채널 페이지에서 핸들 추출 → CNEC API 조회 → 오버레이 표시
;(function () {
  let currentHandle = null
  let overlay = null

  function getHandle() {
    const path = window.location.pathname
    const m = path.match(/^\/@([a-zA-Z0-9_.-]+)/) || path.match(/^\/channel\/([a-zA-Z0-9_-]+)/)
    return m ? m[1].toLowerCase() : null
  }

  function createOverlay(data) {
    if (overlay) overlay.remove()
    overlay = document.createElement('div')
    overlay.className = 'cnec-overlay'
    const followers = data.followers ? Number(data.followers).toLocaleString() : '-'
    const er = data.er ? `${Number(data.er).toFixed(1)}%` : '-'

    overlay.innerHTML = `
      <button class="cnec-overlay-close" id="cnec-close">✕</button>
      <div class="cnec-overlay-title">CNEC Connect · YouTube</div>
      <div class="cnec-overlay-handle">${data.name || data.handle || currentHandle}</div>
      <div class="cnec-overlay-row"><span class="cnec-overlay-label">구독자</span><span class="cnec-overlay-value">${followers}</span></div>
      <div class="cnec-overlay-row"><span class="cnec-overlay-label">참여율</span><span class="cnec-overlay-value accent">${er}</span></div>
      <div class="cnec-overlay-row"><span class="cnec-overlay-label">카테고리</span><span class="cnec-overlay-value">${(data.categories || []).join(', ') || '-'}</span></div>
    `
    document.body.appendChild(overlay)
    document.getElementById('cnec-close').addEventListener('click', () => overlay.remove())
  }

  function check() {
    const handle = getHandle()
    if (!handle || handle === currentHandle) return
    currentHandle = handle
    chrome.runtime.sendMessage({ type: 'LOOKUP', handle }, (res) => {
      if (res?.ok && res.creator) createOverlay(res.creator)
    })
  }

  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl) { lastUrl = location.href; setTimeout(check, 1000) }
  }).observe(document.body, { childList: true, subtree: true })
  setTimeout(check, 1500)
})()
