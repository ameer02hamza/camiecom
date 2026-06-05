"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  Settings,
  Heart,
  ChevronRight,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutCustomer } from "@/features/auth/store/authSlice";
import { shopifyFetch, GET_CUSTOMER_ORDERS } from "@/shared/lib/shopify";
import { formatPrice } from "@/shared/utils/formatPrice";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";
import { AccountPageSkeleton } from "@/shared/ui/Badge";

interface ShopifyOrder {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  currentTotalPrice: { amount: string; currencyCode: string };
  lineItems: {
    edges: {
      node: {
        title: string;
        quantity: number;
        variant: { image: { url: string } | null } | null;
      };
    }[];
  };
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-brand-sage/10 text-brand-sage",
  PENDING: "bg-yellow-100 text-yellow-700",
  FULFILLED: "bg-brand-warm/10 text-brand-warm",
  CANCELLED: "bg-brand-red/10 text-brand-red",
  UNFULFILLED: "bg-blue-100 text-blue-700",
  REFUNDED: "bg-brand-red/10 text-brand-red",
};

export default function AccountPage() {
  const dispatch    = useAppDispatch();
  const router      = useRouter();
  // ── useAuthGuard handles redirect + fetchCustomer ──
  const { customer, accessToken, loading } = useAuthGuard();
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length);

  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch orders when accessToken available
  useEffect(() => {
    if (!accessToken) return;
    setOrdersLoading(true);
    shopifyFetch<{
      customer: {
        orders: {
          pageInfo: { hasNextPage: boolean };
          edges: { node: ShopifyOrder }[];
        };
      } | null;
    }>({
      query: GET_CUSTOMER_ORDERS,
      variables: { customerAccessToken: accessToken, first: 5, after: null },
      cache: "no-store",
    })
      .then((data) =>
        setOrders(data.customer?.orders.edges.map((e) => e.node) ?? []),
      )
      .catch(console.error)
      .finally(() => setOrdersLoading(false));
  }, [accessToken]);

  const handleLogout = async () => {
    await dispatch(logoutCustomer());
    router.push("/");
  };

  // Loading state:
  // - accessToken nahi → useAuthGuard redirect karega
  // - customer nahi + loading → fetch ho raha hai → skeleton
  // - customer nahi + loading false → fetch fail ya nahi hua → redirect
  if (!accessToken) return <AccountPageSkeleton />
  if (loading && !customer) return <AccountPageSkeleton />
  if (!loading && !customer) {
    // Fetch fail hua — login pe bhejo
    return <AccountPageSkeleton />
  }

  const activeOrder = orders.find(
    (o) =>
      o.fulfillmentStatus === "UNFULFILLED" ||
      o.fulfillmentStatus === "PARTIALLY_FULFILLED",
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-warm/20 flex items-center justify-center flex-shrink-0">
            <span className="font-display text-2xl text-brand-warm font-bold">
              {customer?.firstName?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-0.5">
              My Account
            </p>
            <h1 className="font-display text-3xl tracking-heading">
              Hi, {customer?.firstName}! 👋
            </h1>
            <p className="text-sm text-ink-2 dark:text-ink-dk2 mt-0.5">
              {customer?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-ink-2 dark:text-ink-dk2 hover:text-brand-red transition-colors"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: Package,
            label: "Orders",
            value: ordersLoading ? "..." : orders.length,
            href: "/account/orders",
          },
          { icon: Heart, label: "Wishlist", value: wishlistCount, href: "/account/wishlist" },
          {
            icon: MapPin,
            label: "Addresses",
            value: customer?.defaultAddress ? 1 : 0,
            href: "/account/addresses",
          },
        ].map(({ icon: Icon, label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-surface-light dark:bg-surface-dark rounded-card p-5 shadow-soft hover:shadow-card transition-all hover:-translate-y-0.5 text-center"
          >
            <Icon size={22} className="mx-auto text-brand-warm mb-3" />
            <p className="text-2xl font-bold text-ink-1 dark:text-ink-dk1">
              {value}
            </p>
            <p className="text-xs text-ink-2 dark:text-ink-dk2 mt-0.5">
              {label}
            </p>
          </Link>
        ))}
      </div>

      {/* Active Order Banner */}
      {activeOrder && (
        <div className="bg-brand-warm/8 border border-brand-warm/20 rounded-card p-5 mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-warm/15 rounded-btn flex items-center justify-center flex-shrink-0">
              <Package size={16} className="text-brand-warm" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-1 dark:text-ink-dk1">
                Order #{activeOrder.orderNumber} is being processed
              </p>
              <p className="text-xs text-ink-2 dark:text-ink-dk2">
                Placed{" "}
                {new Date(activeOrder.processedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                {" · "}
                {formatPrice(parseFloat(activeOrder.currentTotalPrice.amount))}
              </p>
            </div>
          </div>
          <Link
            href="/account/orders"
            className="flex-shrink-0 text-xs font-medium text-brand-warm hover:underline flex items-center gap-1"
          >
            Track <ChevronRight size={12} />
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft mb-8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light dark:border-border-dark">
          <h2 className="text-sm font-semibold text-ink-1 dark:text-ink-dk1">
            Recent Orders
          </h2>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-xs text-brand-warm hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <Loader2
              size={18}
              className="animate-spin text-ink-2 dark:text-ink-dk2"
            />
            <span className="text-sm text-ink-2 dark:text-ink-dk2">
              Loading orders...
            </span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package
              size={32}
              className="mx-auto text-ink-2 dark:text-ink-dk2 mb-3 opacity-40"
            />
            <p className="text-sm text-ink-2 dark:text-ink-dk2 mb-3">
              No orders yet
            </p>
            <Link
              href="/shop"
              className="text-xs text-brand-warm hover:underline"
            >
              Start shopping →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {orders.slice(0, 3).map((order) => {
              const statusLabel =
                order.fulfillmentStatus || order.financialStatus;
              const statusStyle =
                STATUS_STYLES[statusLabel] ?? "bg-gray-100 text-gray-600";
              const firstImage =
                order.lineItems.edges[0]?.node.variant?.image?.url;
              const itemCount = order.lineItems.edges.reduce(
                (s, e) => s + e.node.quantity,
                0,
              );

              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${encodeURIComponent(order.id)}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-bg-light dark:hover:bg-bg-dark transition-colors"
                >
                  {/* Product thumbnail */}
                  <div className="w-12 h-12 rounded-btn overflow-hidden bg-border-light dark:bg-border-dark flex-shrink-0">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt="Order item"
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package
                          size={16}
                          className="text-ink-2 dark:text-ink-dk2"
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-ink-1 dark:text-ink-dk1">
                        #{order.orderNumber}
                      </p>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-pill capitalize ${statusStyle}`}
                      >
                        {statusLabel.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-ink-2 dark:text-ink-dk2">
                      {new Date(order.processedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" · "}
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-ink-1 dark:text-ink-dk1">
                      {formatPrice(parseFloat(order.currentTotalPrice.amount))}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Details */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft p-6 mb-8">
        <h2 className="text-xs font-semibold text-ink-2 dark:text-ink-dk2 tracking-label uppercase mb-4">
          Account Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <p className="text-ink-2 dark:text-ink-dk2 mb-0.5">Full Name</p>
            <p className="font-medium text-ink-1 dark:text-ink-dk1">
              {customer?.firstName} {customer?.lastName}
            </p>
          </div>
          <div>
            <p className="text-ink-2 dark:text-ink-dk2 mb-0.5">Email Address</p>
            <p className="font-medium text-ink-1 dark:text-ink-dk1">
              {customer?.email}
            </p>
          </div>
          {customer?.phone && (
            <div>
              <p className="text-ink-2 dark:text-ink-dk2 mb-0.5">Phone</p>
              <p className="font-medium text-ink-1 dark:text-ink-dk1">
                {customer?.phone}
              </p>
            </div>
          )}
          <div>
            <p className="text-ink-2 dark:text-ink-dk2 mb-0.5">
              Marketing Emails
            </p>
            <p className="font-medium text-ink-1 dark:text-ink-dk1">
              {customer?.acceptsMarketing
                ? "✅ Subscribed"
                : "❌ Not subscribed"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft divide-y divide-border-light dark:divide-border-dark mb-10">
        {[
          {
            icon: Package,
            label: "Order History",
            sub: `${orders.length} order${orders.length !== 1 ? "s" : ""}`,
            href: "/account/orders",
          },
          {
            icon: Heart,
            label: "Wishlist",
            sub: `${wishlistCount} saved items`,
            href: "/account/wishlist",
          },
          {
            icon: MapPin,
            label: "Saved Addresses",
            sub: "Manage shipping addresses",
            href: "/account/addresses",
          },
          {
            icon: Settings,
            label: "Account Settings",
            sub: "Email, password, preferences",
            href: "/account/settings",
          },
        ].map(({ icon: Icon, label, sub, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 px-5 py-4 hover:bg-border-light/40 dark:hover:bg-border-dark/40 transition-colors"
          >
            <div className="w-9 h-9 bg-bg-light dark:bg-bg-dark rounded-btn flex items-center justify-center flex-shrink-0">
              <Icon size={16} className="text-ink-2 dark:text-ink-dk2" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1">
                {label}
              </p>
              <p className="text-xs text-ink-2 dark:text-ink-dk2">{sub}</p>
            </div>
            <ChevronRight size={15} className="text-ink-2 dark:text-ink-dk2" />
          </Link>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm text-brand-red hover:underline"
        >
          <LogOut size={14} /> Sign out of your account
        </button>
      </div>
    </div>
  );
}