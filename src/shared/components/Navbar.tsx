"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Heart,
  Menu,
  Sun,
  Moon,
  UserRound,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleCart } from "@/features/cart/store/cartSlice";
import {
  openMobileMenu,
  openSearch,
  toggleTheme,
} from "@/features/ui/store/uiSlice";
import { cn } from "@/shared/utils/cn";
import { SITE_NAME } from "@/shared/constants/config";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/collections/new-arrivals", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector((s) => s.cart.totalQuantity);
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length);
  const theme = useAppSelector((s) => s.ui.theme);

  return (
    <header className="sticky top-0 z-50 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-xl border-b border-border-light dark:border-border-dark">
      {/* Top promo bar */}
      <div className="bg-brand-dark dark:bg-black text-brand-light text-center text-xs py-2 px-4 tracking-label">
        Free shipping on orders over $15
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Mobile menu */}
          <button
            onClick={() => dispatch(openMobileMenu())}
            className="lg:hidden p-2 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-display text-2xl font-bold text-brand-dark dark:text-brand-light tracking-heading">
              {" "}
              <span className="hidden sm:inline">{SITE_NAME}</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-brand-dark dark:hover:text-brand-light",
                  pathname.startsWith(href) && href !== "/"
                    ? "text-brand-dark dark:text-brand-light"
                    : "text-ink-2 dark:text-ink-dk2",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => dispatch(openSearch())}
              className="p-2 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors"
            >
              <Search size={18} />
            </button>

            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <Link
              href="/account"
              className="relative p-2 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors"
            >
              <UserRound size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-brand-red text-white text-[10px] font-bold rounded-pill flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-brand-dark dark:bg-brand-light dark:text-brand-dark text-brand-light text-[10px] font-bold rounded-pill flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
