// 이메일 어댑터. EMAIL_PROVIDER=ses|smtp|console (기본 console)
// 통일 인터페이스: sendEmail({ to, subject, text, html, from })

const provider = (process.env.EMAIL_PROVIDER || 'console').toLowerCase()
const DEFAULT_FROM = process.env.EMAIL_FROM || 'no-reply@cnec.co'

function b64(s) { return Buffer.from(s, 'utf8').toString('base64') }

async function sendViaConsole({ to, subject, text, from }) {
  console.log(`[email:console] → ${to}  "${subject}"  from=${from}\n  ${text?.slice(0, 200)}`)
  return { id: `console_${Date.now()}`, provider: 'console' }
}

// AWS SES via REST API (SigV4 필요) — 가장 단순한 건 SMTP로 SES 사용
// 여기선 Gmail/범용 SMTP 1개 경로만 지원 (nodemailer 의존 추가 안 하려고 Native fetch + SES API v2 호출 생략).
// 운영은 SMTP 권장: EMAIL_PROVIDER=smtp, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS

async function sendViaSmtp({ to, subject, text, html, from }) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) throw new Error('SMTP env missing')

  // Minimal SMTP client (TLS/STARTTLS), works with Gmail App Password, SES SMTP, etc.
  const net = await import('node:net')
  const tls = await import('node:tls')

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port }, () => {})
    const send = (cmd) => new Promise((r) => { socket.write(cmd + '\r\n'); socket.once('data', (d) => r(d.toString())) })
    let secure = false

    socket.setTimeout(20000)
    socket.once('timeout', () => { socket.destroy(); reject(new Error('SMTP timeout')) })
    socket.once('error', reject)

    socket.once('data', async (d) => {
      try {
        let res = d.toString()
        if (!res.startsWith('220')) throw new Error('SMTP greet: ' + res)
        res = await send(`EHLO cnec.co`)
        if (port === 587) {
          res = await send(`STARTTLS`)
          if (!res.startsWith('220')) throw new Error('STARTTLS: ' + res)
          const tsock = tls.connect({ socket, servername: host }, async () => {
            secure = true
            try {
              const s = (cmd) => new Promise((r) => { tsock.write(cmd + '\r\n'); tsock.once('data', (d) => r(d.toString())) })
              await s(`EHLO cnec.co`)
              let r = await s(`AUTH LOGIN`)
              if (!r.startsWith('334')) throw new Error('AUTH: ' + r)
              r = await s(b64(user))
              if (!r.startsWith('334')) throw new Error('USER: ' + r)
              r = await s(b64(pass))
              if (!r.startsWith('235')) throw new Error('PASS: ' + r)
              r = await s(`MAIL FROM:<${from}>`)
              if (!r.startsWith('250')) throw new Error('MAIL: ' + r)
              r = await s(`RCPT TO:<${to}>`)
              if (!r.startsWith('250') && !r.startsWith('251')) throw new Error('RCPT: ' + r)
              r = await s(`DATA`)
              if (!r.startsWith('354')) throw new Error('DATA: ' + r)
              const headers = [
                `From: ${from}`,
                `To: ${to}`,
                `Subject: =?UTF-8?B?${b64(subject)}?=`,
                `MIME-Version: 1.0`,
                `Content-Type: text/plain; charset=UTF-8`,
                `Content-Transfer-Encoding: base64`,
              ].join('\r\n')
              const mime = headers + '\r\n\r\n' + b64(text || '') + '\r\n.'
              r = await s(mime)
              if (!r.startsWith('250')) throw new Error('SEND: ' + r)
              await s(`QUIT`)
              tsock.end()
              resolve({ id: `smtp_${Date.now()}`, provider: 'smtp' })
            } catch (e) { tsock.destroy(); reject(e) }
          })
          tsock.on('error', reject)
        } else {
          reject(new Error('Port 465 TLS not implemented in minimal client; use 587 STARTTLS'))
        }
      } catch (e) { reject(e) }
    })
  })
}

export async function sendEmail({ to, subject, text, html, from = DEFAULT_FROM }) {
  if (!to) throw new Error('to required')
  if (provider === 'smtp') return sendViaSmtp({ to, subject, text, html, from })
  return sendViaConsole({ to, subject, text, from })
}

export function currentProvider() { return provider }
