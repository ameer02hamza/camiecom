"use client";
import { useState } from "react";
import { Mail, MessageSquare, Clock, CheckCircle } from "lucide-react";
import Button from "@/shared/ui/Button";
import { useTranslations } from "next-intl";

export default function ContactPage() {
  const t = useTranslations('contact')
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
          {t('label')}
        </p>
        <h1 className="font-display text-5xl tracking-heading">{t('title')}</h1>
        <p className="text-ink-2 dark:text-ink-dk2 mt-3 max-w-md mx-auto leading-body">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Info */}
        <div className="space-y-6">
          {[
            { icon: Mail,         title: t('email_title'),    body: t('email_body'),    sub: t('email_sub') },
            { icon: MessageSquare,title: t('chat_title'),     body: t('chat_body'),     sub: t('chat_sub') },
            { icon: Clock,        title: t('response_title'), body: t('response_body'), sub: t('response_sub') },
          ].map(({ icon: Icon, title, body, sub }) => (
            <div key={title} className="flex gap-4">
              <div className="w-10 h-10 bg-brand-warm/10 rounded-btn flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-brand-warm" />
              </div>
              <div>
                <p className="font-medium text-sm text-ink-1 dark:text-ink-dk1">{title}</p>
                <p className="text-sm text-ink-2 dark:text-ink-dk2">{body}</p>
                <p className="text-xs text-ink-2 dark:text-ink-dk2">{sub}</p>
              </div>
            </div>
          ))}

          <div className="border border-border-light dark:border-border-dark rounded-card p-5 mt-4">
            <p className="text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-2">
              {t('faq_title')}
            </p>
            {[
              t('faq_shipping'),
              t('faq_returns'),
              t('faq_size'),
              t('faq_care'),
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
              <h2 className="font-display text-2xl mb-2">{t('success_title')}</h2>
              <p className="text-sm text-ink-2 dark:text-ink-dk2">
                {t('success_body', { email: form.email })}
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
                    {t('label_name')}
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
                    {t('label_email')}
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
                  {t('label_subject')}
                </label>
                <select
                  value={form.subject}
                  onChange={f("subject")}
                  required
                  className="w-full h-11 px-4 text-sm border border-border-light dark:border-border-dark rounded-btn bg-surface-light dark:bg-surface-dark text-ink-1 dark:text-ink-dk1 focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors"
                >
                  <option value="">{t('subject_placeholder')}</option>
                  <option>{t('subject_order')}</option>
                  <option>{t('subject_return')}</option>
                  <option>{t('subject_product')}</option>
                  <option>{t('subject_sizing')}</option>
                  <option>{t('subject_other')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-1 dark:text-ink-dk1 mb-1.5">
                  {t('label_message')}
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={f("message")}
                  placeholder={t('message_placeholder')}
                  className="w-full px-4 py-3 text-sm border border-border-light dark:border-border-dark rounded-card bg-transparent focus:outline-none focus:border-brand-dark dark:focus:border-brand-light transition-colors resize-none"
                />
              </div>
              <Button type="submit" fullWidth size="lg" loading={loading}>
                {t('send')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
