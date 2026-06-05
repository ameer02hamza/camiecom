import { NextRequest, NextResponse } from 'next/server'
import { shopifyFetch, CUSTOMER_RECOVER } from '@/shared/lib/shopify'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 })
    }

    await shopifyFetch<{
      customerRecover: {
        customerUserErrors: { code: string; field: string[]; message: string }[]
      }
    }>({
      query: CUSTOMER_RECOVER,
      variables: { email },
    })

    // Always return success — Shopify doesn't confirm if email exists (security best practice)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
