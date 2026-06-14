import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Leaf, Heart, Globe } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = { title: 'About Us', description: 'The Camiecom story — considered pieces for a considered wardrobe.' }

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden">
        <Image 
                  loading="eager"
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80" alt="About Camiecom" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-brand-dark/55" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-brand-warm text-xs font-semibold tracking-label uppercase mb-4">{t('our_story_label')}</p>
            <h1 className="font-display text-5xl sm:text-6xl text-white tracking-heading leading-tight">{t('hero_title')}</h1>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="font-display text-3xl sm:text-4xl text-ink-1 dark:text-ink-dk1 tracking-heading leading-snug mb-8">
          {t('mission_quote')}
        </p>
        <p className="text-ink-2 dark:text-ink-dk2 leading-body text-lg">
          {t('mission_body')}
        </p>
      </section>

      {/* Values */}
      <section className="bg-surface-light dark:bg-surface-dark py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl tracking-heading text-center mb-14">{t('values_title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: t('value_sustainable_title'), body: t('value_sustainable_body') },
              { icon: Heart, title: t('value_quality_title'), body: t('value_quality_body') },
              { icon: Globe, title: t('value_transparency_title'), body: t('value_transparency_body') },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="text-center px-6">
                <div className="w-14 h-14 bg-brand-warm/10 rounded-panel flex items-center justify-center mx-auto mb-5">
                  <Icon size={24} className="text-brand-warm" />
                </div>
                <h3 className="font-display text-xl mb-3 tracking-heading">{title}</h3>
                <p className="text-sm text-ink-2 dark:text-ink-dk2 leading-body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image break */}
      <section className="grid grid-cols-1 md:grid-cols-2 h-[400px]">
        <div className="relative">
          <Image src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=900&q=80"
                  loading="eager"  alt="Atelier" fill className="object-cover" sizes="50vw" />
        </div>
        <div className="bg-brand-dark flex items-center justify-center px-12 py-16 text-center">
          <div>
            <p className="font-display text-3xl text-brand-light leading-snug mb-6">{t('quote_text')}</p>
            <p className="text-brand-light/50 text-sm">{t('quote_attr')}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-4">
        <h2 className="font-display text-4xl tracking-heading mb-5">{t('cta_title')}</h2>
        <p className="text-ink-2 dark:text-ink-dk2 mb-8 max-w-md mx-auto leading-body">{t('cta_body')}</p>
        <Link href="/shop" className="inline-flex items-center gap-2 h-12 px-8 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity">
          {t('cta_shop')} <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  )
}
