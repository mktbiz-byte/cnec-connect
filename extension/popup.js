document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['apiBase', 'token'], (s) => {
    document.getElementById('api').value = s.apiBase || ''
    document.getElementById('token').value = s.token || ''
  })
  document.getElementById('save').addEventListener('click', () => {
    chrome.storage.local.set({
      apiBase: document.getElementById('api').value.trim(),
      token: document.getElementById('token').value.trim(),
    }, () => {
      const msg = document.getElementById('msg')
      msg.style.display = 'block'
      setTimeout(() => msg.style.display = 'none', 2000)
    })
  })
})
