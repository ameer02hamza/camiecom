import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import ReduxProvider from '@/providers/ReduxProvider'
import Navbar from '@/shared/components/Navbar'
import Footer from '@/shared/components/Footer'
import CartDrawer from '@/shared/components/CartDrawer'
import ToastContainer from '@/shared/components/ToastContainer'
import MobileMenu from '@/shared/components/MobileMenu'
import SearchOverlay from '@/shared/components/SearchOverlay'
import '../globals.css'

export const metadata: Metadata = {
  title: { default: 'Camiecom — Dress with Intention', template: '%s | Camiecom' },
  description: 'A premium fashion brand. Considered pieces for a considered wardrobe.',
}

const locales = ['en', 'fr']

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <NextIntlClientProvider messages={messages}>
          <ReduxProvider>
            <Navbar />
            <MobileMenu />
            <SearchOverlay />
            <CartDrawer />
            <ToastContainer />
            <main>{children}</main>
            <Footer />
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
