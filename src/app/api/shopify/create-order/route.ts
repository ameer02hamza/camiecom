// ─── POST /api/shopify/create-order ──────────────────────────────────────────
// Creates a Shopify order via Draft Orders Admin REST API.
// write_draft_orders scope — works on development stores, no special approval.
// Flow: Create Draft Order → Complete it → Real order created, inventory deducted.

import { NextRequest, NextResponse } from 'next/server'

const SHOPIFY_STORE  = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
const ADMIN_TOKEN    = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN!
const API_VERSION    = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? '2026-04'
const ADMIN_ENDPOINT = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}`

interface LineItem {
  variantId:    string  // gid://shopify/ProductVariant/123
  quantity:     number
  price:        number
  title:        string
  variantTitle: string
}

interface ShippingAddress {
  firstName: string
  lastName:  string
  address:   string
  city:      string
  state:     string
  zip:       string
  country:   string
  phone:     string
}

interface CreateOrderBody {
  lineItems:     LineItem[]
  shipping:      ShippingAddress
  email:         string
  shippingCost:  number
  paymentMethod: 'card' | 'cod'
}

// gid://shopify/ProductVariant/123456 → 123456
function gidToId(gid: string): number {
  const parts = gid.split('/')
  return parseInt(parts[parts.length - 1], 10)
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderBody = await req.json()
    const { lineItems, shipping, email, shippingCost, paymentMethod } = body

    const subtotal   = lineItems.reduce((s, i) => s + i.price * i.quantity, 0)
    const tax        = subtotal * 0.08
    const orderTotal = subtotal + shippingCost + tax

    // ── Step 1: Draft Order create karo ──────────────────────────────────────
    const draftPayload = {
      draft_order: {
        email,
        use_customer_default_address: false,
        shipping_address: {
          first_name: shipping.firstName,
          last_name:  shipping.lastName,
          address1:   shipping.address,
          city:       shipping.city,
          province:   shipping.state,
          zip:        shipping.zip,
          country:    shipping.country,
          phone:      shipping.phone || undefined,
        },
        line_items: lineItems.map(item => ({
          variant_id: gidToId(item.variantId),
          quantity:   item.quantity,
          price:      item.price.toFixed(2),
          title:      item.title,
        })),
        shipping_line: {
          title:  shippingCost > 0 ? 'Standard Shipping' : 'Free Shipping',
          price:  shippingCost.toFixed(2),
          code:   shippingCost > 0 ? 'STANDARD' : 'FREE',
        },
        tags: paymentMethod === 'cod' ? 'COD' : 'card',
        note: `Payment: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}`,
        send_receipt: true,
      },
    }

    const draftRes = await fetch(`${ADMIN_ENDPOINT}/draft_orders.json`, {
      method:  'POST',
      headers: {
        'Content-Type':           'application/json',
        'X-Shopify-Access-Token': ADMIN_TOKEN,
      },
      body: JSON.stringify(draftPayload),
    })

    if (!draftRes.ok) {
      const err = await draftRes.json()
      console.error('Draft order failed:', err)
      return NextResponse.json(
        { error: 'Failed to create draft order', detail: err },
        { status: draftRes.status }
      )
    }

    const { draft_order } = await draftRes.json()

    // ── Step 2: Complete karo — real order banta hai, inventory deduct hoti hai
    const completeRes = await fetch(
      `${ADMIN_ENDPOINT}/draft_orders/${draft_order.id}/complete.json?payment_pending=${paymentMethod === 'cod'}`,
      {
        method:  'PUT',
        headers: {
          'Content-Type':           'application/json',
          'X-Shopify-Access-Token': ADMIN_TOKEN,
        },
      }
    )

    if (!completeRes.ok) {
      const err = await completeRes.json()
      console.error('Draft complete failed:', err)
      // Draft order bana but complete nahi hua — phir bhi draft order return karo
      return NextResponse.json({
        success:     true,
        orderId:     draft_order.id,
        orderNumber: draft_order.order_number ?? draft_order.id,
        orderName:   draft_order.name ?? `#${draft_order.id}`,
        email:       draft_order.email,
        total:       orderTotal.toFixed(2),
        currency:    'EUR',
        createdAt:   draft_order.created_at,
        lineItems:   lineItems.map((item, i) => ({
          id:       String(i),
          title:    item.title,
          variant:  item.variantTitle,
          quantity: item.quantity,
          price:    item.price,
          image:    '',
        })),
        shippingAddress: {
          first_name: shipping.firstName,
          last_name:  shipping.lastName,
          address1:   shipping.address,
          city:       shipping.city,
          province:   shipping.state,
          zip:        shipping.zip,
          country:    shipping.country,
        },
        financialStatus: 'pending',
      })
    }

    const { draft_order: completed } = await completeRes.json()

    // ── Step 3: Return order data to frontend ─────────────────────────────────
    return NextResponse.json({
      success:     true,
      orderId:     completed.order_id ?? completed.id,
      orderNumber: completed.order_number ?? completed.id,
      orderName:   completed.name ?? `#${completed.order_number}`,
      email:       completed.email,
      total:       orderTotal.toFixed(2),
      currency:    'EUR',
      createdAt:   completed.updated_at ?? completed.created_at,
      lineItems:   lineItems.map((item, i) => ({
        id:       String(i),
        title:    item.title,
        variant:  item.variantTitle,
        quantity: item.quantity,
        price:    item.price,
        image:    '',
      })),
      shippingAddress: {
        first_name: shipping.firstName,
        last_name:  shipping.lastName,
        address1:   shipping.address,
        city:       shipping.city,
        province:   shipping.state,
        zip:        shipping.zip,
        country:    shipping.country,
      },
      financialStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    })

  } catch (err: any) {
    console.error('create-order error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}