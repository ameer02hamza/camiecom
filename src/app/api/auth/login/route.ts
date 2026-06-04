import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { shopifyFetch, CUSTOMER_LOGIN } from '@/shared/lib/shopify'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const data = await shopifyFetch<{
      customerAccessTokenCreate: {
        customerAccessToken: { accessToken: string; expiresAt: string } | null
        customerUserErrors: { code: string; field: string[]; message: string }[]
      }
    }>({
      query: CUSTOMER_LOGIN,
      variables: { input: { email, password } },
    })

    const errors = data.customerAccessTokenCreate.customerUserErrors
    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: errors[0].message }, { status: 401 })
    }

    const token = data.customerAccessTokenCreate.customerAccessToken
    if (!token) {
      return NextResponse.json({ success: false, error: 'Login failed' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set('shopify_token', token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      accessToken: token.accessToken,
      expiresAt: token.expiresAt,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
