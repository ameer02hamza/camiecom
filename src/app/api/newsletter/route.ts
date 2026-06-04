import { NextRequest, NextResponse } from 'next/server'
import { shopifyFetch, NEWSLETTER_SUBSCRIBE } from '@/shared/lib/shopify'

export async function POST(req: NextRequest) {
  try {
    const { email, subscribe } = await req.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 })
    }

    if (!subscribe) {
      return NextResponse.json({
        success: false,
        error: 'To unsubscribe, please log in to your account and update your preferences.',
      })
    }

    const randomPw = Math.random().toString(36).slice(-12) + 'Aa1!'
    const data = await shopifyFetch<{
      customerCreate: {
        customer: { id: string; email: string; acceptsMarketing: boolean } | null
        customerUserErrors: { code: string; field: string[]; message: string }[]
      }
    }>({
      query: NEWSLETTER_SUBSCRIBE,
      variables: { email, password: randomPw },
    })

    const errors = data.customerCreate.customerUserErrors
    const alreadyExists = errors.some(
      (e) => e.code === 'TAKEN' || e.code === 'CUSTOMER_DISABLED'
    )

    if (errors.length > 0 && !alreadyExists) {
      return NextResponse.json({ success: false, error: errors[0].message })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
