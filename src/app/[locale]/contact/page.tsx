"use client";
import { useState } from "react";
import { Mail, MessageSquare, Clock, CheckCircle } from "lucide-react";
import Button from "@/shared/ui/Button";
import type { Metadata } from "next";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const f =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <p className="text-xs font-semibold tracking-label uppercase text-ink-2 dark:text-ink-dk2 mb-2">
          Get in touch
        </p>
        <h1 className="font-display text-5xl tracking-heading">Contact Us</h1>
        <p className="text-ink-2 dark:text-ink-dk2 mt-3 max-w-md mx-auto leading-body">
          We'd love to hear from you. Send us a message and we'll respond within
          one business day.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Info */}
        <div className="space-y-6">
          {[
            {
              icon: Mail,
              title: "Email",
              body: "hello@Camiecom-brand.com",
              sub: "We reply within 24h",
            },
            {
              icon: MessageSquare,
              title: "Live Chat",
              body: "Available in-app",
              sub: "Mon–Fri, 9am–6pm GMT",
            },
            {
              icon: Clock,
              title: "Response Time",
              body: "< 24 hours",
              sub: "Usually much faster",
            },
          ].map(({ icon: Icon, title, body, sub }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 bg-brand-warm/10 rounded-btn flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-brand-warm" />
              </div>
              <div>
                <p className="font-medium text-sm text-ink-1 dark:text-ink-dk1">
                  {title}
                </p>
                <p className="text-sm text-ink-2 dark:text-ink-dk2">{body}</p>
                <p className="text-xs text-ink-2 dark:text-ink-dk2">{sub}</p>
              </div>
            </div>
          ))}

          <div className="border border-border-light dark:border-border-dark rounded-card p-5 mt-4">
            <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-2">
              Common questions
            </p>
            {[
              "Shipping & tracking",
              "Returns & exchanges",
              "Size guide",
              "Care instructions",
            ].map((q) => (
              <button
                key={q}
                className="block text-sm text-ink-2 dark:text-ink-dk2 hover:text-brand-warm transition-colors py-1"
              >
                {q} →
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="bg-surface-light dark:bg-surface-dark rounded-panel shadow-card p-12 text-center">
              <div className="w-16 h-16 bg-brand-sage/10 rounded-panel flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={28} className="text-brand-sage" />
              </div>
              <h2 className="font-display text-2xl mb-2">Message sent!</h2>
              <p className="text-sm text-ink-2 dark:text-ink-dk2">
                We'll get back to you at {form.email} within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-surface-light dark:bg-surface-dark rounded-panel shadow-card p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                    Full Name
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={f("name")}
                    placeholder="Hamza Morgan"
                    className="w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={f("email")}
                    placeholder="your@camiecom.com"
                    className="w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                  Subject
                </label>
                <select
                  value={form.subject}
                  onChange={f("subject")}
                  required
                  className="w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-surface-light dark:bg-surface-dark text-ink-1 dark:text-ink-dk1 focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors"
                >
                  <option value="">Select a topic…</option>
                  <option>Order issue</option>
                  <option>Return or exchange</option>
                  <option>Product question</option>
                  <option>Sizing help</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={f("message")}
                  placeholder="Tell us how we can help…"
                  className="w-full px-4 py-3 text-sm border border-border-light dark:border-border-dark rounded-card bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors resize-none"
                />
              </div>
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
