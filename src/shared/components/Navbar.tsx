"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Heart,
  Menu,
  Sun,
  Moon,
  UserRound,
  Settings,
  Package,
  MapPin,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleCart } from "@/features/cart/store/cartSlice";
import {
  openMobileMenu,
  openSearch,
  toggleTheme,
} from "@/features/ui/store/uiSlice";
import { logoutCustomer } from "@/features/auth/store/authSlice";
import { cn } from "@/shared/utils/cn";
import { SITE_NAME } from "@/shared/constants/config";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/collections/new-arrivals", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const DROPDOWN_ITEMS = [
  { href: "/account", label: "My Account", icon: UserRound },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const cartCount = useAppSelector((s) => s.cart.totalQuantity);
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length);
  const theme = useAppSelector((s) => s.ui.theme);
  const customer = useAppSelector((s) => s.auth.customer);
  const authLoading = useAppSelector((s) => s.auth.loading);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await dispatch(logoutCustomer());
    router.push("/");
  };

  // Avatar initials from customer name
  const initials = customer
    ? `${customer.firstName?.[0] ?? ""}${customer.lastName?.[0] ?? ""}`.toUpperCase() ||
      "U"
    : "";

  return (
    <header className="sticky top-0 z-50 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-xl border-b border-border-light dark:border-border-dark">
      {/* Promo bar */}
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


            {/* Cart */}
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


            {/* ── User area ── */}
            {!authLoading && customer ? (
              // ── Logged in — avatar + dropdown ──
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-btn hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors"
                >
                  {/* Avatar circle */}
                  <div className="w-7 h-7 rounded-pill bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {initials}
                  </div>
                  {/* Name — hidden on mobile */}
                  <span className="hidden sm:block text-sm font-medium text-ink-1 dark:text-ink-dk1 max-w-[80px] truncate">
                    {customer.firstName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-ink-2 dark:text-ink-dk2 transition-transform duration-200",
                      dropdownOpen ? "rotate-180" : "",
                    )}
                  />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card shadow-hover z-50 overflow-hidden animate-fade-in">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
                      <p className="text-sm font-semibold text-ink-1 dark:text-ink-dk1 truncate">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-xs text-ink-2 dark:text-ink-dk2 truncate mt-0.5">
                        {customer.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      {DROPDOWN_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-1 dark:text-ink-dk1 hover:bg-border-light/60 dark:hover:bg-border-dark/60 transition-colors"
                        >
                          <Icon
                            size={15}
                            className="text-ink-2 dark:text-ink-dk2 flex-shrink-0"
                          />
                          {label}
                        </Link>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-border-light dark:border-border-dark py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <LogOut size={15} className="flex-shrink-0" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ── Not logged in — simple icon ──
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
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
