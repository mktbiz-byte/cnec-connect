// Instagram 프로필 페이지에서 핸들 추출 → CNEC API 조회 → 오버레이 표시
;(function () {
  let currentHandle = null
  let overlay = null

  function getHandle() {
    const path = window.location.pathname
    const m = path.match(/^\/([a-zA-Z0-9_.]+)\/?$/)
    return m ? m[1].toLowerCase() : null
  }

  function createOverlay(data) {
    if (overlay) overlay.remove()
    overlay = document.createElement('div')
    overlay.className = 'cnec-overlay'
    const followers = data.followers ? Number(data.followers).toLocaleString() : '-'
    const er = data.er ? `${Number(data.er).toFixed(1)}%` : '-'
    const categories = (data.categories || []).join(', ') || '-'

    overlay.innerHTML = `
      <button class="cnec-overlay-close" id="cnec-close">✕</button>
      <div class="cnec-overlay-title">CNEC Connect</div>
      <div class="cnec-overlay-handle">@${data.handle || currentHandle}</div>
      <div class="cnec-overlay-row"><span class="cnec-overlay-label">팔로워</span><span class="cnec-overlay-value">${followers}</span></div>
      <div class="cnec-overlay-row"><span class="cnec-overlay-label">참여율</span><span class="cnec-overlay-value accent">${er}</span></div>
      <div class="cnec-overlay-row"><span class="cnec-overlay-label">카테고리</span><span class="cnec-overlay-value">${categories}</span></div>
      <div class="cnec-overlay-row"><span class="cnec-overlay-label">소스</span><span class="cnec-overlay-value">${data.source || '-'}</span></div>
      ${data.email ? `<div class="cnec-overlay-row"><span class="cnec-overlay-label">이메일</span><span class="cnec-overlay-value">${data.email}</span></div>` : ''}
      ${data.phone ? `<div class="cnec-overlay-row"><span class="cnec-overlay-label">폰</span><span class="cnec-overlay-value">${data.phone}</span></div>` : ''}
    `
    document.body.appendChild(overlay)
    document.getElementById('cnec-close').addEventListener('click', () => overlay.remove())
  }

  function showNotFound() {
    if (overlay) overlay.remove()
    overlay = document.createElement('div')
    overlay.className = 'cnec-overlay'
    overlay.innerHTML = `
      <button class="cnec-overlay-close" id="cnec-close">✕</button>
      <div class="cnec-overlay-title">CNEC Connect</div>
      <div class="cnec-overlay-handle">@${currentHandle}</div>
      <div style="margin-top:8px;color:#6B7280;font-size:12px;">이 크리에이터는 CNEC DB에 등록되지 않았습니다.</div>
    `
    document.body.appendChild(overlay)
    document.getElementById('cnec-close').addEventListener('click', () => overlay.remove())
  }

  function check() {
    const handle = getHandle()
    if (!handle || handle === currentHandle) return
    if (['explore', 'reels', 'stories', 'direct', 'accounts', 'p'].includes(handle)) return
    currentHandle = handle

    chrome.runtime.sendMessage({ type: 'LOOKUP', handle }, (res) => {
      if (res?.ok && res.creator) createOverlay(res.creator)
      else showNotFound()
    })
  }

  // SPA 네비게이션 대응
  let lastUrl = location.href
  new MutationObserver(() => {
    if (location.href !== lastUrl) { lastUrl = location.href; setTimeout(check, 1000) }
  }).observe(document.body, { childList: true, subtree: true })

  setTimeout(check, 1500)
})()
