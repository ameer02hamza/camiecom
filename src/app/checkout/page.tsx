"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Check,
  CreditCard,
  Truck,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart } from "@/features/cart/store/cartSlice";
import { formatPrice } from "@/shared/utils/formatPrice";
import Button from "@/shared/ui/Button";
import { cn } from "@/shared/utils/cn";
import { shopifyFetch, UPDATE_BUYER_IDENTITY } from "@/shared/lib/shopify";

type Step = "shipping" | "payment";

interface ShippingForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}
interface PaymentForm {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
  method: "card" | "cod";
}

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Pakistan",
  "UAE",
  "Singapore",
];
const COUNTRY_CODES: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  Canada: "CA",
  Australia: "AU",
  Germany: "DE",
  France: "FR",
  Pakistan: "PK",
  UAE: "AE",
  Singapore: "SG",
};

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalAmount, checkoutUrl, cartId } = useAppSelector(s => s.cart)
  const customer = useAppSelector(s => s.auth.customer)

  const [step, setStep] = useState<Step>("shipping");
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState<ShippingForm>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    phone: "",
  });

  // Autofill from logged-in customer
  useEffect(() => {
    if (!customer) return
    setShipping(prev => ({
      ...prev,
      email:     customer.email      || prev.email,
      firstName: customer.firstName  || prev.firstName,
      lastName:  customer.lastName   || prev.lastName,
      phone:     customer.phone      || prev.phone,
    }))
  }, [customer])
  const [payment, setPayment] = useState<PaymentForm>({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    method: "card",
  });

  const shippingCost = totalAmount >= 150 ? 0 : 12;
  const tax = totalAmount * 0.08;
  const total = totalAmount + shippingCost + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center px-4">
        <div>
          <h1 className="font-display text-3xl mb-3">Your cart is empty</h1>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const sf =
    (field: keyof ShippingForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setShipping((p) => ({ ...p, [field]: e.target.value }));

  const pf =
    (field: keyof PaymentForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setPayment((p) => ({ ...p, [field]: e.target.value }));

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExpiry = (v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 4);
    return clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Step 1: Shopify cart mein buyer info pre-fill karo
      // Taake Shopify checkout pe jaake dobara details na bharne paRein
      if (cartId && checkoutUrl) {
        await shopifyFetch({
          query: UPDATE_BUYER_IDENTITY,
          variables: {
            cartId,
            buyerIdentity: {
              email: shipping.email,
              phone: shipping.phone || undefined,
              deliveryAddressPreferences: [
                {
                  deliveryAddress: {
                    firstName: shipping.firstName,
                    lastName: shipping.lastName,
                    address1: shipping.address,
                    city: shipping.city,
                    province: shipping.state,
                    zip: shipping.zip,
                    countryCode: COUNTRY_CODES[shipping.country] ?? "US",
                  },
                },
              ],
            },
          },
        });
        // Step 2: Shopify checkout pe redirect — details pehle se filled hongi
        window.location.href = checkoutUrl;
        return;
      }
    } catch (err) {
      console.error("Buyer identity update failed:", err);
      // Error pe bhi redirect karo — user manually fill kar lega
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
    }
    setLoading(false);
  };

  const inputClass =
    "w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors";

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Top bar */}
      <div className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl font-bold text-brand-dark dark:text-brand-light"
          >
            {" "}
            Camiecom
          </Link>
          <div className="flex items-center gap-2 text-xs text-ink-2 dark:text-ink-dk2">
            <Lock size={12} />
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
        {/* ── LEFT: FORM ── */}
        <div>
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/cart"
              className="text-sm text-ink-2 dark:text-ink-dk2 hover:text-ink-1 dark:hover:text-ink-dk1 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={14} /> Cart
            </Link>
            <span className="text-border-light dark:text-border-dark">/</span>
            {(["shipping", "payment"] as Step[]).map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <button
                  onClick={() =>
                    s === "payment" && step === "payment"
                      ? setStep("shipping")
                      : undefined
                  }
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors",
                    step === s
                      ? "text-ink-1 dark:text-ink-dk1"
                      : "text-ink-2 dark:text-ink-dk2",
                    s === "payment" && step === "payment"
                      ? "cursor-pointer"
                      : "",
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-pill text-xs flex items-center justify-center",
                      step === s
                        ? "bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark"
                        : s === "shipping" && step === "payment"
                          ? "bg-brand-sage text-white"
                          : "bg-border-light dark:bg-border-dark text-ink-2 dark:text-ink-dk2",
                    )}
                  >
                    {s === "shipping" && step === "payment" ? (
                      <Check size={11} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="capitalize">{s}</span>
                </button>
                {i === 0 && (
                  <span className="text-border-light dark:text-border-dark">
                    /
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* ── SHIPPING FORM ── */}
          {step === "shipping" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-display text-2xl tracking-heading mb-5 flex items-center gap-2">
                  <Truck size={20} className="text-brand-warm" /> Contact &
                  Shipping
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={shipping.email}
                      onChange={customer ? undefined : sf("email")}
                      readOnly={!!customer}
                      placeholder="you@camiecom.com"
                      className={inputClass + (customer ? ' opacity-70 cursor-not-allowed bg-border-light dark:bg-border-dark' : '')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                        First name
                      </label>
                      <input
                        required
                        value={shipping.firstName}
                        onChange={sf("firstName")}
                        placeholder="Hamza"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                        Last name
                      </label>
                      <input
                        required
                        value={shipping.lastName}
                        onChange={sf("lastName")}
                        placeholder="Morgan"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                      Address
                    </label>
                    <input
                      required
                      value={shipping.address}
                      onChange={sf("address")}
                      placeholder="123 Main Street, Apt 4B"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                        City
                      </label>
                      <input
                        required
                        value={shipping.city}
                        onChange={sf("city")}
                        placeholder="New York"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                        State / Province
                      </label>
                      <input
                        value={shipping.state}
                        onChange={sf("state")}
                        placeholder="NY"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                        ZIP / Postal code
                      </label>
                      <input
                        required
                        value={shipping.zip}
                        onChange={sf("zip")}
                        placeholder="10001"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                        Country
                      </label>
                      <select
                        value={shipping.country}
                        onChange={sf("country")}
                        className="w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-surface-light dark:bg-surface-dark text-ink-1 dark:text-ink-dk1 focus:outline-none focus:border-brand-dark dark:focus:border-brand-light cursor-pointer"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={sf("phone")}
                      placeholder="+1 555 000 0000"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={() => {
                  if (
                    !shipping.email ||
                    !shipping.firstName ||
                    !shipping.lastName ||
                    !shipping.address ||
                    !shipping.city ||
                    !shipping.zip
                  ) {
                    alert("Please fill in all required fields.");
                    return;
                  }
                  setStep("payment");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Continue to Payment <ArrowRight size={16} />
              </Button>
            </div>
          )}

          {/* ── PAYMENT FORM ── */}
          {step === "payment" && (
            <div className="space-y-6 animate-fade-in">
              {/* Shipping summary */}
              <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card p-4 text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-ink-2 dark:text-ink-dk2 mb-0.5">
                      Shipping to
                    </p>
                    <p className="font-medium text-ink-1 dark:text-ink-dk1">
                      {shipping.firstName} {shipping.lastName}
                    </p>
                    <p className="text-ink-2 dark:text-ink-dk2">
                      {shipping.address}, {shipping.city} {shipping.zip}
                    </p>
                    <p className="text-ink-2 dark:text-ink-dk2">
                      {shipping.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep("shipping")}
                    className="text-brand-warm text-xs hover:underline flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <h2 className="font-display text-2xl tracking-heading mb-5 flex items-center gap-2">
                  <CreditCard size={20} className="text-brand-warm" /> Payment
                  Method
                </h2>

                {/* Method toggle */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    {
                      value: "card" as const,
                      label: "Credit / Debit Card",
                      icon: "💳",
                    },
                    {
                      value: "cod" as const,
                      label: "Cash on Delivery",
                      icon: "💵",
                    },
                  ].map((m) => (
                    <button
                      key={m.value}
                      onClick={() =>
                        setPayment((p) => ({ ...p, method: m.value }))
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 border-2 rounded-card text-sm font-medium transition-all",
                        payment.method === m.value
                          ? "border-brand-dark dark:border-brand-light bg-brand-dark/5 dark:bg-brand-light/5 text-ink-1 dark:text-ink-dk1"
                          : "border-border-light dark:border-border-dark text-ink-2 dark:text-ink-dk2 hover:border-brand-dark/40 dark:hover:border-brand-light/40",
                      )}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <span className="text-center text-xs leading-tight">
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Card fields */}
                {/* {payment.method === 'card' && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs text-ink-2 dark:text-ink-dk2 mb-4">
                      <Lock size={12} />
                      <span>Your card details are encrypted and secure (dummy — no real charges)</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">Name on card</label>
                      <input value={payment.cardName} onChange={pf('cardName')} placeholder="Hamza Morgan" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">Card number</label>
                      <div className="relative">
                        <input value={payment.cardNumber}
                          onChange={e => setPayment(p => ({...p, cardNumber: formatCard(e.target.value)}))}
                          placeholder="1234 5678 9012 3456" maxLength={19} className={cn(inputClass, 'pr-12')} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">💳</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">Expiry date</label>
                        <input value={payment.expiry}
                          onChange={e => setPayment(p => ({...p, expiry: formatExpiry(e.target.value)}))}
                          placeholder="MM/YY" maxLength={5} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">CVC</label>
                        <input value={payment.cvc}
                          onChange={e => setPayment(p => ({...p, cvc: e.target.value.replace(/\D/g,'').slice(0,4)}))}
                          placeholder="123" maxLength={4} className={inputClass} />
                      </div>
                    </div>
                  </div>
                )} */}

                {payment.method === "cod" && (
                  <div className="bg-brand-sage/10 border border-brand-sage/20 rounded-card p-4 text-sm text-brand-sage animate-fade-in">
                    <p className="font-medium mb-1">
                      Cash on Delivery selected
                    </p>
                    <p className="text-brand-sage/80">
                      Pay when your order arrives. Our delivery partner will
                      collect the payment.
                    </p>
                  </div>
                )}
              </div>

              <Button
                fullWidth
                size="lg"
                loading={loading}
                onClick={handlePlaceOrder}
              >
                <Lock size={15} />
                {loading
                  ? "Redirecting..."
                  : `Continue to Secure Payment — ${formatPrice(total)}`}
              </Button>

              {/* Shopify checkout notice */}
              <div className="flex items-start gap-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-card p-3">
                <span className="text-base flex-shrink-0">🔒</span>
                <p className="text-xs text-ink-2 dark:text-ink-dk2 leading-relaxed">
                  Your shipping info will be pre-filled. You&apos;ll complete
                  payment securely on Shopify&apos;s checkout — your card
                  details are never stored on our servers.
                </p>
              </div>

              <p className="text-center text-xs text-ink-2 dark:text-ink-dk2">
                By placing your order you agree to our{" "}
                <span className="text-brand-warm cursor-pointer hover:underline">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-brand-warm cursor-pointer hover:underline">
                  Privacy Policy
                </span>
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT: ORDER SUMMARY ── */}
        <div>
          <div className="bg-surface-light dark:bg-surface-dark rounded-panel shadow-card p-6 sticky top-24">
            <h3 className="font-display text-lg mb-5">Order Summary</h3>

            {/* Items */}
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto scrollbar-hide">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="relative w-14 h-16 flex-shrink-0 rounded-btn overflow-hidden bg-border-light dark:bg-border-dark">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-dark dark:bg-brand-light text-brand-light dark:text-brand-dark text-[10px] font-bold rounded-pill flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-xs text-ink-2 dark:text-ink-dk2">
                      {item.variantTitle}
                    </p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="Gift card or discount code"
                className="flex-1 h-9 px-3 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors"
              />
              <button className="h-9 px-3 text-sm font-medium border border-border-light dark:border-border-dark rounded-btn hover:bg-border-light dark:hover:bg-border-dark transition-colors flex-shrink-0">
                Apply
              </button>
            </div>

            {/* Totals */}
            <div className="space-y-2.5 text-sm border-t border-border-light dark:border-border-dark pt-4">
              <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
                <span>Shipping</span>
                <span
                  className={
                    shippingCost === 0 ? "text-brand-sage font-medium" : ""
                  }
                >
                  {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-ink-2 dark:text-ink-dk2">
                <span>Tax (est.)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border-light dark:border-border-dark">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Trust */}
            <div className="mt-5 pt-5 border-t border-border-light dark:border-border-dark">
              {[
                "Free returns within 30 days",
                "Secure 256-bit SSL encryption",
                "Quality guaranteed or refunded",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2 mb-2">
                  <Check size={13} className="text-brand-sage flex-shrink-0" />
                  <span className="text-xs text-ink-2 dark:text-ink-dk2">
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
