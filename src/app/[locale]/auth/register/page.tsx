'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { WILAYAS, wilayaName } from '@/lib/wilayas';
import type { Role } from '@/lib/types';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const tErr = useTranslations('auth.errors');
  const router = useRouter();
  const locale = useLocale();
  const search = useSearchParams();

  const queryRole = search.get('role');
  const initialRole: Role = queryRole === 'supplier' || queryRole === 'delivery' || queryRole === 'reparateur' ? queryRole : 'buyer';

  const [role, setRole] = useState<Role>(initialRole);
  const [form, setForm] = useState({
    fullName:        '',
    businessName:    '',
    email:           '',
    phone:           '',
    wilaya:          '',
    password:        '',
    confirmPassword: '',
    terms:           false,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Update role if query changes
  useEffect(() => {
    if (queryRole === 'supplier' || queryRole === 'delivery' || queryRole === 'reparateur' || queryRole === 'buyer') {
      setRole(queryRole);
    }
  }, [queryRole]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!form.fullName) {
      setError(`${t('fullName')} : ${tErr('required')}`);
      return;
    }
    if (!form.email) {
      setError(`${t('email')} : ${tErr('required')}`);
      return;
    }
    if (!form.password) {
      setError(`${t('password')} : ${tErr('required')}`);
      return;
    }
    if (role !== 'buyer' && role !== 'reparateur' && !form.businessName) {
      setError(`${t('businessName')} : ${tErr('required')}`);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError(tErr('invalidEmail'));
      return;
    }
    if (form.password.length < 8) {
      setError(tErr('shortPassword'));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(tErr('passwordMismatch'));
      return;
    }
    if (!form.terms) {
      setError(tErr('acceptTerms'));
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          fullName:     form.fullName,
          businessName: (role !== 'buyer' && role !== 'reparateur') ? form.businessName : undefined,
          email:        form.email,
          phone:        form.phone,
          wilaya:       form.wilaya,
          password:     form.password,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.error === 'EMAIL_TAKEN') {
          setError("Cet email est déjà utilisé. Veuillez vous connecter.");
        } else if (body.error === 'INVALID_INPUT') {
          setError(`Erreur de saisie dans le champ : ${body.field}`);
        } else {
          setError("Une erreur inattendue s'est produite côté serveur.");
        }
        return;
      }
      router.push('/dashboard/buyer');
    } catch {
      setError("Erreur de connexion avec le serveur. Veuillez réessayer.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl bg-white p-6 shadow-card-lg ring-1 ring-ink-200/60 md:p-10">
        <h1 className="text-2xl font-extrabold text-ink-900 md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-ink-600">{t('subtitle')}</p>

        {/* Role picker */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {(['buyer', 'supplier', 'delivery', 'reparateur'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={
                'rounded-xl border-2 p-4 text-start transition ' +
                (role === r
                  ? 'border-brand-500 bg-brand-50 shadow-card'
                  : 'border-ink-200 bg-white hover:border-ink-300')
              }
              aria-pressed={role === r}
            >
              <div className="mb-1 flex items-center gap-2">
                <RoleIcon role={r} />
                <span className="text-sm font-bold text-ink-900">
                  {t(`roles.${r}.title`)}
                </span>
              </div>
              <div className="text-xs text-ink-500">{t(`roles.${r}.desc`)}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
          <Field
            label={t('fullName')}
            value={form.fullName}
            onChange={(v) => set('fullName', v)}
            required
            autoComplete="name"
          />

          {role !== 'buyer' && role !== 'reparateur' && (
            <Field
              label={t('businessName')}
              value={form.businessName}
              onChange={(v) => set('businessName', v)}
              required
              autoComplete="organization"
            />
          )}

          <Field
            label={t('email')}
            type="email"
            value={form.email}
            onChange={(v) => set('email', v)}
            required
            autoComplete="email"
          />

          <Field
            label={t('phone')}
            type="tel"
            value={form.phone}
            onChange={(v) => set('phone', v)}
            autoComplete="tel"
            placeholder="+213 ..."
          />

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">
              {t('wilaya')}
            </label>
            <select
              value={form.wilaya}
              onChange={(e) => set('wilaya', e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              <option value="">—</option>
              {WILAYAS.map((w) => (
                <option key={w.code} value={String(w.code)}>
                  {String(w.code).padStart(2, '0')} — {wilayaName(w, locale)}
                </option>
              ))}
            </select>
          </div>

          <Field
            label={t('password')}
            type="password"
            value={form.password}
            onChange={(v) => set('password', v)}
            required
            autoComplete="new-password"
          />

          <Field
            label={t('confirmPassword')}
            type="password"
            value={form.confirmPassword}
            onChange={(v) => set('confirmPassword', v)}
            required
            autoComplete="new-password"
          />

          <label className="flex items-start gap-2 text-sm text-ink-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => set('terms', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
            />
            <span>{t('terms')}</span>
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 sm:col-span-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-card transition hover:bg-brand-600 disabled:opacity-60 sm:col-span-2"
          >
            {busy ? '...' : t('submit')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-600">
          {t('hasAccount')}{' '}
          <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">
            {t('login')}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type = 'text',
  value,
  onChange,
  required,
  autoComplete,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-800">
        {label}
      </label>
      <input
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder-ink-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
      />
    </div>
  );
}

function RoleIcon({ role }: { role: Role }) {
  if (role === 'buyer') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600" aria-hidden>
        <circle cx="12" cy="8" r="4" /><path d="M3 21v-1a7 7 0 0 1 14 0v1" /><path d="M18 8v6M21 11h-6" />
      </svg>
    );
  }
  if (role === 'supplier') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600" aria-hidden>
        <path d="M3 21V8l9-5 9 5v13" /><path d="M9 21V12h6v9" />
      </svg>
    );
  }
  if (role === 'reparateur') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600" aria-hidden>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600" aria-hidden>
      <rect x="1" y="6" width="14" height="11" rx="1.5" /><path d="M15 10h4l3 3v4h-7z" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="19" r="2" />
    </svg>
  );
}
