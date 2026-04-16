// 간단한 결제 어댑터. PAYMENT_PROVIDER=mock 이 기본이며 실제 운영 시 stripe 로 전환.
// Stripe 연동은 동일 인터페이스로 대체 가능하도록 설계.

const provider = (process.env.PAYMENT_PROVIDER || 'mock').toLowerCase()

export async function createEscrowIntent({ amount, currency = 'KRW', metadata }) {
  if (provider === 'stripe') {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY missing')
    const params = new URLSearchParams({
      amount: String(amount),
      currency: currency.toLowerCase(),
      capture_method: 'manual',
      'automatic_payment_methods[enabled]': 'true',
    })
    for (const [k, v] of Object.entries(metadata || {})) params.append(`metadata[${k}]`, String(v))
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })
    if (!res.ok) throw new Error(`stripe:${res.status}`)
    const data = await res.json()
    return { id: data.id, clientSecret: data.client_secret, provider: 'stripe' }
  }
  // mock
  return {
    id: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    clientSecret: null,
    provider: 'mock',
  }
}

export async function captureEscrow(providerTxnId) {
  if (provider === 'stripe') {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    const res = await fetch(`https://api.stripe.com/v1/payment_intents/${providerTxnId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${stripeKey}` },
    })
    if (!res.ok) throw new Error(`stripe:${res.status}`)
    return await res.json()
  }
  return { id: providerTxnId, status: 'captured', mock: true }
}

export function currentProvider() { return provider }
