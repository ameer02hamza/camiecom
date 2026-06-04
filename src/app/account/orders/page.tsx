"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Loader2,
  ChevronDown,
  CreditCard,
  Box,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatPrice } from "@/shared/utils/formatPrice";
import { shopifyFetch, GET_CUSTOMER_ORDERS } from "@/shared/lib/shopify";
import { useAppSelector } from "@/store/hooks";
import { useAuthGuard } from "@/shared/hooks/useAuthGuard";

const ORDERS_PER_PAGE = 10;

// ─── Stepper logic ─────────────────────────────────────────────────────────────

type StepStatus = "done" | "active" | "upcoming";

interface Step {
  label: string;
  icon: React.ElementType;
  status: StepStatus;
}

/**
 * Derives stepper steps from Shopify's financialStatus + fulfillmentStatus.
 *
 * Steps: Order Placed → Payment Confirmed → Processing → Dispatched → Delivered
 * Edge-cases: CANCELLED / REFUNDED show a single "Cancelled" step.
 */
function getSteps(financialStatus: string, fulfillmentStatus: string): Step[] {
  const fin = financialStatus.toUpperCase();
  const ful = fulfillmentStatus.toUpperCase();

  // Cancelled / Refunded — special single-step
  if (fin === "CANCELLED" || fin === "REFUNDED" || ful === "RESTOCKED") {
    return [
      { label: "Order Placed", icon: Package, status: "done" },
      { label: "Cancelled / Refunded", icon: XCircle, status: "active" },
    ];
  }

  const steps: { label: string; icon: React.ElementType }[] = [
    { label: "Order Placed", icon: Package },
    { label: "Payment Confirmed", icon: CreditCard },
    { label: "Processing", icon: Box },
    { label: "Dispatched", icon: Truck },
    { label: "Delivered", icon: CheckCircle2 },
  ];

  // Figure out which step index is currently "active"
  let activeIndex = 0;

  if (fin === "PENDING") {
    activeIndex = 0; // placed, waiting payment
  } else if (fin === "PAID" || fin === "AUTHORIZED") {
    if (ful === "UNFULFILLED") {
      activeIndex = 2; // paid → processing
    } else if (ful === "PARTIALLY_FULFILLED" || ful === "IN_TRANSIT") {
      activeIndex = 3; // dispatched
    } else if (ful === "FULFILLED") {
      activeIndex = 4; // delivered — all done
    } else {
      activeIndex = 1; // paid, ful unknown → payment confirmed
    }
  } else {
    activeIndex = 1;
  }

  return steps.map((s, i) => ({
    ...s,
    status:
      i < activeIndex ? "done" : i === activeIndex ? "active" : "upcoming",
  }));
}

// ─── OrderStepper component ────────────────────────────────────────────────────

function OrderStepper({
  financialStatus,
  fulfillmentStatus,
}: {
  financialStatus: string;
  fulfillmentStatus: string;
}) {
  const steps = getSteps(financialStatus, fulfillmentStatus);
  const isCancelled = steps.some((s) => s.label === "Cancelled / Refunded");

  return (
    <div className="px-6 py-5 border-t border-border-light dark:border-border-dark bg-bg-light/50 dark:bg-bg-dark/50">
      <p className="text-[10px] font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-4">
        Order Status
      </p>
      <div className="flex items-start gap-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === steps.length - 1;

          const dotColor =
            step.status === "done"
              ? "bg-brand-warm text-white"
              : step.status === "active"
                ? isCancelled
                  ? "bg-brand-red text-white"
                  : "bg-brand-warm text-white"
                : "bg-border-light dark:bg-border-dark text-ink-2 dark:text-ink-dk2";

          const labelColor =
            step.status === "done"
              ? "text-ink-2 dark:text-ink-dk2"
              : step.status === "active"
                ? isCancelled
                  ? "text-brand-red font-semibold"
                  : "text-brand-warm font-semibold"
                : "text-ink-2/50 dark:text-ink-dk2/40";

          const lineColor =
            step.status === "done"
              ? "bg-brand-warm"
              : "bg-border-light dark:bg-border-dark";

          return (
            <div
              key={step.label}
              className={`flex flex-col items-center ${isLast ? "flex-none" : "flex-1"}`}
            >
              {/* Dot + line */}
              <div className="flex items-center w-full">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${dotColor} ${step.status === "active" ? "ring-4 ring-brand-warm/20" : ""}`}
                >
                  <Icon size={14} />
                </div>
                {!isLast && (
                  <div
                    className={`h-0.5 flex-1 mx-1 rounded-full transition-colors ${lineColor}`}
                  />
                )}
              </div>

              {/* Label */}
              <p
                className={`text-[10px] mt-2 text-center leading-tight w-14 transition-colors ${labelColor}`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-brand-sage/10 text-brand-sage",
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  FULFILLED: "bg-brand-warm/10 text-brand-warm",
  CANCELLED: "bg-brand-red/10 text-brand-red",
  UNFULFILLED:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  REFUNDED: "bg-brand-red/10 text-brand-red",
};

interface ShopifyOrderLineItem {
  title: string;
  quantity: number;
  variant: { image: { url: string } | null; price: { amount: string } } | null;
}

interface ShopifyOrder {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  currentTotalPrice: { amount: string; currencyCode: string };
  lineItems: { edges: { node: ShopifyOrderLineItem }[] };
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { accessToken } = useAuthGuard();

  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (cursor: string | null = null, append = false) => {
      if (!accessToken) return;
      append ? setLoadingMore(true) : setLoading(true);
      try {
        const data = await shopifyFetch<{
          customer: {
            orders: {
              pageInfo: { hasNextPage: boolean; endCursor: string };
              edges: { node: ShopifyOrder }[];
            };
          } | null;
        }>({
          query: GET_CUSTOMER_ORDERS,
          variables: {
            customerAccessToken: accessToken,
            first: ORDERS_PER_PAGE,
            after: cursor,
          },
          cache: "no-store",
        });
        const newOrders = data.customer?.orders.edges.map((e) => e.node) ?? [];
        setOrders((prev) => (append ? [...prev, ...newOrders] : newOrders));
        setHasNextPage(data.customer?.orders.pageInfo.hasNextPage ?? false);
        setEndCursor(data.customer?.orders.pageInfo.endCursor ?? null);
      } catch {
        setError("Could not load orders. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [accessToken],
  );

  useEffect(() => {
    if (accessToken) fetchOrders(null, false);
  }, [accessToken, fetchOrders]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 mb-8 transition-colors"
      >
        <ArrowLeft size={15} /> Back to account
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Package size={22} className="text-brand-warm" />
          <h1 className="font-display text-3xl tracking-heading">
            Order History
          </h1>
        </div>
        {!loading && orders.length > 0 && (
          <span className="text-sm text-ink-2 dark:text-ink-dk2">
            {orders.length}
            {hasNextPage ? "+" : ""} orders
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2
            size={28}
            className="animate-spin text-ink-2 dark:text-ink-dk2"
          />
          <p className="text-sm text-ink-2 dark:text-ink-dk2">
            Loading your orders...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-ink-2 dark:text-ink-dk2">
          <p className="text-lg mb-2">{error}</p>
          {!accessToken && (
            <Link
              href="/auth/login"
              className="text-brand-warm hover:underline text-sm"
            >
              Log in →
            </Link>
          )}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package
            size={40}
            className="mx-auto text-ink-2 dark:text-ink-dk2 opacity-30 mb-4"
          />
          <p className="text-lg text-ink-2 dark:text-ink-dk2 mb-2">
            No orders yet
          </p>
          <Link
            href="/shop"
            className="text-brand-warm hover:underline text-sm"
          >
            Start shopping →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {orders.map((order) => {
              const items = order.lineItems.edges.map((e) => e.node);
              const statusLabel =
                order.fulfillmentStatus || order.financialStatus;
              const statusStyle =
                STATUS_STYLES[statusLabel] ?? "bg-gray-100 text-gray-600";
              const itemCount = items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="bg-surface-light dark:bg-surface-dark rounded-card shadow-soft overflow-hidden"
                >
                  {/* ── Card Header ── */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark">
                    <div className="flex items-center gap-5">
                      <div>
                        <p className="text-xs text-ink-2 dark:text-ink-dk2 mb-0.5">
                          Order
                        </p>
                        <p className="font-semibold text-sm text-ink-1 dark:text-ink-dk1">
                          #{order.orderNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-2 dark:text-ink-dk2 mb-0.5">
                          Date
                        </p>
                        <p className="text-sm text-ink-1 dark:text-ink-dk1">
                          {new Date(order.processedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-2 dark:text-ink-dk2 mb-0.5">
                          Total
                        </p>
                        <p className="font-semibold text-sm text-ink-1 dark:text-ink-dk1">
                          {formatPrice(
                            parseFloat(order.currentTotalPrice.amount),
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-ink-2 dark:text-ink-dk2 mb-0.5">
                          Items
                        </p>
                        <p className="text-sm text-ink-1 dark:text-ink-dk1">
                          {itemCount}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-3 py-1.5 rounded-pill capitalize ${statusStyle}`}
                    >
                      {statusLabel.toLowerCase().replace("_", " ")}
                    </span>
                  </div>

                  {/* ── Tracking Stepper ── */}
                  <OrderStepper
                    financialStatus={order.financialStatus}
                    fulfillmentStatus={order.fulfillmentStatus}
                  />

                  {/* ── Line Items ── */}
                  <div className="px-6 py-3 divide-y divide-border-light/60 dark:divide-border-dark/60">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-3">
                        <div className="relative w-12 h-12 flex-shrink-0 rounded-btn overflow-hidden bg-border-light dark:bg-border-dark">
                          {item.variant?.image?.url && (
                            <Image
                              src={item.variant.image.url}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-ink-2 dark:text-ink-dk2">
                            Qty {item.quantity}
                          </p>
                        </div>
                        {item.variant && (
                          <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1 flex-shrink-0">
                            {formatPrice(
                              parseFloat(item.variant.price.amount) *
                                item.quantity,
                            )}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchOrders(endCursor, true)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-8 py-3 border border-border-light dark:border-border-dark rounded-btn text-sm font-medium hover:bg-border-light dark:hover:bg-border-dark transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown size={15} /> Load More Orders
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
