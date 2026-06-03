"use client";
import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/shared/constants/config";

const LINKS = {
  Shop: [
    ["All Products", "/shop"],
    ["New Arrivals", "/shop"],
    ["Sale", "/shop"],
    ["Collections", "/shop"],
  ],
  Info: [
    ["About Us", "/about"],
    ["Contact", "/contact"],
    ["Sustainability", "/about"],
    ["Careers", "/about"],
  ],
  Help: [
    ["Shipping Info", "/contact"],
    ["Returns", "/contact"],
    ["Size Guide", "/shop"],
    ["FAQ", "/contact"],
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border-light dark:border-border-dark mt-24">
      {/* Newsletter */}
      <div className="bg-brand-dark dark:bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-display text-3xl text-brand-light mb-2">
            Stay in the loop
          </h3>
          <p className="text-brand-light/60 text-sm mb-8">
            New arrivals, exclusive offers, and style inspiration.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="jhon@example.com"
              required
              className="flex-1 h-11 px-4 rounded-btn bg-white/10 border border-white/20 text-brand-light placeholder:text-brand-light/40 text-sm focus:outline-none focus:border-brand-warm"
            />
            <button
              type="submit"
              className="h-11 px-6 bg-brand-warm text-white rounded-btn text-sm font-medium hover:opacity-90 transition-opacity flex-shrink-0"
            >
              Subscribe
            </button>
          </form>
          <p className="text-brand-light/40 text-xs mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <p className="font-display text-2xl font-bold text-brand-dark dark:text-brand-light mb-2">
              {" "}
              {SITE_NAME}
            </p>
            <p className="text-sm text-ink-2 dark:text-ink-dk2 leading-body">
              {SITE_TAGLINE}
            </p>
          </div>
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-4">
                {section}
              </h4>
              <ul className="space-y-2">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-ink-1 dark:text-ink-dk1 hover:text-brand-warm transition-colors"
                    >
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
          <p className="text-xs text-ink-2 dark:text-ink-dk2">
            This store is to integrate shopify by hamza <br /> you can contact
            him on ameer02hamza@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
}
