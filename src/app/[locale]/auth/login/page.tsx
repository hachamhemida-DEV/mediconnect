'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const tErr = useTranslations('auth.errors');
  const router = useRouter();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [busy, setBusy]         = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError(`${t('email')} : ${tErr('required')}`);
      return;
    }
    if (!password) {
      setError(`${t('password')} : ${tErr('required')}`);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.error === 'INVALID_CREDENTIALS') {
          setError('Email ou mot de passe incorrect.');
        } else if (body.error === 'INVALID_INPUT') {
          setError(tErr('invalidEmail'));
        } else {
          setError("Une erreur inattendue s'est produite. Réessayez.");
        }
        return;
      }
      // Redirect based on user role
      const role = body.data?.role;
      if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'supplier') {
        router.push('/dashboard/supplier');
      } else if (role === 'delivery') {
        router.push('/dashboard/delivery');
      } else {
        router.push('/dashboard/buyer');
      }
    } catch {
      setError('Erreur de connexion avec le serveur. Veuillez réessayer.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white p-8 shadow-card-lg ring-1 ring-ink-200/60">
        <h1 className="text-2xl font-extrabold text-ink-900 md:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-ink-600">{t('subtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <Field
            label={t('email')}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={setEmail}
          />

          <Field
            label={t('password')}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={setPassword}
            rightSlot={
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                {t('forgot')}
              </Link>
            }
          />

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
            />
            {t('remember')}
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-card transition hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? '...' : t('submit')}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3 text-xs text-ink-400">
          <div className="h-px flex-1 bg-ink-200" />
          <span>{t('or')}</span>
          <div className="h-px flex-1 bg-ink-200" />
        </div>

        <button
          type="button"
          disabled
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink-700 ring-1 ring-ink-200 disabled:opacity-60"
          title="Phase 3"
        >
          <GoogleIcon />
          {t('google')}
        </button>

        <p className="mt-6 text-center text-sm text-ink-600">
          {t('noAccount')}{' '}
          <Link href="/auth/register" className="font-semibold text-brand-600 hover:text-brand-700">
            {t('register')}
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
  rightSlot,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-semibold text-ink-800">{label}</label>
        {rightSlot}
      </div>
      <input
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder-ink-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335"  d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.8 2.5 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6C12.3 13 17.7 9.5 24 9.5z" />
      <path fill="#4285F4"  d="M46.5 24.5c0-1.6-.2-3.1-.5-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05"  d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6C.9 16.8 0 20.3 0 24s.9 7.2 2.6 10.7l7.8-6z" />
      <path fill="#34A853"  d="M24 48c6.3 0 11.5-2.1 15.3-5.7l-7.6-5.9c-2.1 1.4-4.8 2.2-7.7 2.2-6.3 0-11.7-3.5-14-9l-7.8 6C6.5 42.6 14.6 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}
