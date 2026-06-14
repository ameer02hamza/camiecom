import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Truck, RotateCcw, Leaf } from "lucide-react";
import { HERO_BANNERS, COLLECTION_HIGHLIGHTS } from "@/data/mockData";
import {
  shopifyFetch,
  GET_PRODUCTS,
  GET_COLLECTIONS,
} from "@/shared/lib/shopify";
import {
  mapShopifyProduct,
  ShopifyProductNode,
} from "@/shared/lib/shopifyMapper";
import ProductCard from "@/shared/components/ProductCard";
import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: "Camiecom — Dress with Intention",
  description:
    "Premium fashion brand. Considered pieces for a considered wardrobe.",
};

interface ShopifyCollectionNode {
  id: string;
  handle: string;
  title: string;
  image: { url: string; altText: string } | null;
}

export default async function HomePage() {
  const t = await getTranslations('home')
  const hero = HERO_BANNERS[0];

  const [bestsellersData, newArrivalsData, collectionsData] =
    await Promise.allSettled([
      shopifyFetch<{ products: { edges: { node: ShopifyProductNode }[] } }>({
        query: GET_PRODUCTS,
        variables: { first: 4, sortKey: "BEST_SELLING", reverse: false },
      }),
      shopifyFetch<{ products: { edges: { node: ShopifyProductNode }[] } }>({
        query: GET_PRODUCTS,
        variables: { first: 4, sortKey: "CREATED_AT", reverse: true },
      }),
      shopifyFetch<{
        collections: { edges: { node: ShopifyCollectionNode }[] };
      }>({
        query: GET_COLLECTIONS,
        variables: { first: 4 },
      }),
    ]);

  const bestsellers =
    bestsellersData.status === "fulfilled"
      ? bestsellersData.value.products.edges.map((e) =>
          mapShopifyProduct(e.node),
        )
      : [];

  const newArrivals =
    newArrivalsData.status === "fulfilled"
      ? newArrivalsData.value.products.edges.map((e) =>
          mapShopifyProduct(e.node),
        )
      : [];

  const shopifyCollections =
    collectionsData.status === "fulfilled"
      ? collectionsData.value.collections.edges.map((e) => e.node)
      : [];

  const categoryCards =
    shopifyCollections.length > 0
      ? shopifyCollections.slice(0, 4).map((c) => ({
          id: c.id,
          label: c.title,
          image:
            c.image?.url ??
            COLLECTION_HIGHLIGHTS.find((h) => h.id === c.handle)?.image ??
            "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80",
          href: `/collections/${c.handle}`,
        }))
      : COLLECTION_HIGHLIGHTS;

  const saleItems = [...bestsellers, ...newArrivals]
    .filter((p) => p.isSale)
    .slice(0, 4);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative h-[85vh] min-h-[560px] overflow-hidden">
        <video
  autoPlay
  muted
  loop
  poster={hero.image}
  playsInline
  className="absolute inset-0 w-full h-full object-cover object-center"
>
<source 
  src="https://www.pexels.com/download/video/7287924/" 
  type="video/mp4" 
/>
</video>
        
        {/* <Image
          src={hero.image}
          alt="Hero"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          loading="eager"
        /> */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/70 via-brand-dark/30 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-lg animate-slide-up">
              <span className="inline-block text-brand-warm text-xs font-semibold tracking-label uppercase mb-5 bg-brand-warm/20 backdrop-blur-sm px-3 py-1.5 rounded-pill">
                {t('hero_badge')}
              </span>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-tight tracking-heading mb-6">
                {t('hero_title').split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h1>
              <p className="text-white/75 text-lg leading-body mb-8">
                {t('hero_subtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 h-12 px-8 bg-white text-brand-dark rounded-btn text-sm font-semibold hover:opacity-90 hover:-translate-y-px transition-all"
                >
                  {t('hero_cta')} <ArrowRight size={16} />
                </Link>
                <Link
                  href={"/collections/new-arrivals"}
                  className="inline-flex items-center gap-2 h-12 px-8 border border-white/50 text-white rounded-btn text-sm font-medium hover:bg-white/10 transition-all"
                >
                  {t('hero_cta_secondary')}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/50 animate-pulse" />
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="border-y border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-3 divide-x divide-border-light dark:divide-border-dark text-center">
            {[
              { icon: Truck, label: t('trust_shipping_label'), sub: t('trust_shipping_sub') },
              { icon: RotateCcw, label: t('trust_returns_label'), sub: t('trust_returns_sub') },
              { icon: Leaf, label: t('trust_sustainable_label'), sub: t('trust_sustainable_sub') },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="px-4 py-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3"
              >
                <Icon size={18} className="text-brand-sage flex-shrink-0" />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">
                    {label}
                  </p>
                  <p className="text-xs text-ink-2 dark:text-ink-dk2">{sub}</p>
                </div>
                <p className="text-xs font-medium text-ink-1 dark:text-ink-dk1 sm:hidden">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORY ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-2">
              {t('section_explore')}
            </p>
            <h2 className="font-display text-4xl text-ink-1 dark:text-ink-dk1 tracking-heading">
              {t('section_shop_by_category')}
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink-2 dark:text-ink-dk2 hover:text-brand-warm transition-colors"
          >
            {t('section_view_all')} <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryCards.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative aspect-[3/4] rounded-card overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                  loading="eager"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width:640px) 50vw,25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-display text-xl text-white font-medium">
                  {cat.label}
                </p>
                <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
                  {t('shop_now_link')} <ArrowRight size={11} />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BESTSELLERS ── */}
      {bestsellers.length > 0 && (
        <section className="bg-surface-light dark:bg-surface-dark py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-2">
                  {t('section_top_picks')}
                </p>
                <h2 className="font-display text-4xl text-ink-1 dark:text-ink-dk1 tracking-heading">
                  {t('section_bestsellers')}
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink-2 dark:text-ink-dk2 hover:text-brand-warm transition-colors"
              >
                {t('section_view_all')} <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {bestsellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── SALE BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative h-72 sm:h-96 rounded-panel overflow-hidden bg-brand-dark shadow-card">
          <Image
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1400&q=80"
            alt="Sale"
            fill
                  loading="eager"
            className="object-cover opacity-50"
            sizes="100vw"
          />
          <div className="absolute inset-0 flex items-center justify-center text-center px-8">
            <div>
              <span className="inline-block text-brand-warm text-xs font-semibold tracking-label uppercase mb-4 bg-brand-warm/20 px-3 py-1.5 rounded-pill">
                {t('section_limited_time')}
              </span>
              <h2 className="font-display text-4xl sm:text-5xl text-white tracking-heading mb-4">
                {t('section_sale_title')}
              </h2>
              <p className="text-white/70 mb-8">
                {t('section_sale_sub')}
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 h-12 px-8 bg-white text-brand-dark rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {t('section_shop_sale')} <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-2">
                {t('section_just_dropped')}
              </p>
              <h2 className="font-display text-4xl text-ink-1 dark:text-ink-dk1 tracking-heading">
                {t('section_new_arrivals')}
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink-2 dark:text-ink-dk2 hover:text-brand-warm transition-colors"
            >
              {t('section_view_all')} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── BRAND STATEMENT ── */}
      <section className="bg-brand-dark py-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold tracking-label uppercase text-brand-warm mb-6">
            {t('philosophy_label')}
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-brand-light leading-tight tracking-heading mb-8">
            {t('philosophy_quote').split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </h2>
          <p className="text-brand-light/60 leading-body mb-10 max-w-xl mx-auto">
            {t('philosophy_body')}
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 h-11 px-7 border border-brand-light/30 text-brand-light rounded-btn text-sm font-medium hover:bg-brand-light/10 transition-colors"
          >
            {t('our_story')} <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
