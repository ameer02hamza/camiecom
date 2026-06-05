import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { shopifyFetch, GET_CUSTOMER } from '@/shared/lib/shopify'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('shopify_token')?.value

    if (!token) {
      return NextResponse.json({ customer: null, accessToken: null })
    }

    const data = await shopifyFetch<{ customer: any }>({
      query: GET_CUSTOMER,
      variables: { customerAccessToken: token },
    })

    if (!data.customer) {
      // Token expired — cookie delete karo
      cookieStore.delete('shopify_token')
      return NextResponse.json({ customer: null, accessToken: null })
    }

    return NextResponse.json({ customer: data.customer, accessToken: token })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ customer: null, accessToken: null, error: message })
  }
}
