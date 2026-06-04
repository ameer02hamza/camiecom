'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, Loader2, X } from 'lucide-react'
import { SITE_NAME, SITE_TAGLINE } from '@/shared/constants/config'
import { shopifyFetch, CUSTOMER_UPDATE } from '@/shared/lib/shopify'
import { useAppSelector } from '@/store/hooks'

const LINKS = {
  Shop: [
    ['All Products', '/shop'],
    ['New Arrivals', '/shop'],
    ['Sale',         '/shop'],
    ['Collections',  '/shop'],
  ],
  Info: [
    ['About Us',      '/about'],
    ['Contact',       '/contact'],
    ['Sustainability', '/about'],
    ['Careers',       '/about'],
  ],
  Help: [
    ['Shipping Info', '/contact'],
    ['Returns',       '/contact'],
    ['Size Guide',    '/shop'],
    ['FAQ',           '/contact'],
  ],
}

function NewsletterSection() {
  const { customer, accessToken } = useAppSelector(s => s.auth)

  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus]   = useState<'idle' | 'subscribed' | 'unsubscribed' | 'error'>('idle')
  const [msg, setMsg]         = useState('')

  // If logged in — show their subscription status
  const isLoggedIn   = !!accessToken && !!customer
  const isSubscribed = customer?.acceptsMarketing ?? false

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      // Try creating customer with marketing consent
      // If already exists, Shopify returns CUSTOMER_DISABLED or TAKEN error — that's fine
      const resp = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subscribe: true }),
      })
      const data = await resp.json()
      if (data.success) {
        setStatus('subscribed')
        setMsg("You're subscribed! Welcome to the Camiecom family.")
        setEmail('')
      } else {
        setStatus('error')
        setMsg(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMsg('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMarketing = async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      const newVal = !isSubscribed
      await shopifyFetch({
        query: CUSTOMER_UPDATE,
        variables: { customerAccessToken: accessToken, customer: { acceptsMarketing: newVal } },
        cache: 'no-store',
      })
      setStatus(newVal ? 'subscribed' : 'unsubscribed')
      setMsg(newVal ? "You're now subscribed to our newsletter!" : "You've been unsubscribed successfully.")
      // Refetch customer to update Redux state
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      setMsg('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-brand-dark dark:bg-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="font-display text-3xl text-brand-light mb-2">Stay in the loop</h3>
        <p className="text-brand-light/60 text-sm mb-8">
          New arrivals, exclusive offers, and style inspiration.
        </p>

        {/* Feedback message */}
        {status !== 'idle' && (
          <div className={`inline-flex items-center gap-2 text-sm px-5 py-3 rounded-card mb-6 ${
            status === 'error' ? 'bg-brand-red/20 text-brand-red border border-brand-red/30' :
            'bg-brand-sage/20 text-brand-sage border border-brand-sage/30'
          }`}>
            {status === 'error' ? <X size={15} /> : <Check size={15} />}
            {msg}
          </div>
        )}

        {isLoggedIn ? (
          // Logged-in user — show their current status + toggle
          <div className="flex flex-col items-center gap-4">
            <p className="text-brand-light/70 text-sm">
              {isSubscribed
                ? `You're subscribed with ${customer.email}`
                : `You're not subscribed (${customer.email})`
              }
            </p>
            <button
              onClick={handleToggleMarketing}
              disabled={loading}
              className={`h-11 px-8 rounded-btn text-sm font-medium transition-all inline-flex items-center gap-2 ${
                isSubscribed
                  ? 'bg-white/10 border border-white/30 text-brand-light hover:bg-white/20'
                  : 'bg-brand-warm text-white hover:opacity-90'
              }`}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
                : isSubscribed ? 'Unsubscribe' : 'Subscribe'
              }
            </button>
          </div>
        ) : (
          // Guest — show email form
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading || status === 'subscribed'}
              className="flex-1 h-11 px-4 rounded-btn bg-white/10 border border-white/20 text-brand-light placeholder:text-brand-light/40 text-sm focus:outline-none focus:border-brand-warm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || status === 'subscribed'}
              className="h-11 px-6 bg-brand-warm text-white rounded-btn text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0 inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Subscribing...</> : 'Subscribe'}
            </button>
          </form>
        )}

        <p className="text-brand-light/40 text-xs mt-4">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-border-light dark:border-border-dark mt-24">
      <NewsletterSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <p className="font-display text-2xl font-bold text-brand-dark dark:text-brand-light mb-2">
              {SITE_NAME}
            </p>
            <p className="text-sm text-ink-2 dark:text-ink-dk2 leading-body">{SITE_TAGLINE}</p>
          </div>
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-4">
                {section}
              </h4>
              <ul className="space-y-2">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-ink-1 dark:text-ink-dk1 hover:text-brand-warm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border-light dark:border-border-dark mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-2 dark:text-ink-dk2">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-ink-2 dark:text-ink-dk2">
            <Link href="/contact" className="hover:text-brand-warm transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-brand-warm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
