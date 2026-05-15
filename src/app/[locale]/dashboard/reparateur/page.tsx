import { getSession } from '@/lib/auth';
import { setRequestLocale, getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

interface Props { params: Promise<{ locale: string }>; }

export default async function ReparateurDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  const t = await getTranslations('dashboard');
  const firstName = session?.fullName.split(' ')[0] ?? '';

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink-900 md:text-4xl">
          {t('greeting', { name: firstName })}
        </h1>
        <p className="mt-2 text-base text-ink-600">Bienvenue sur votre tableau de bord réparateur.</p>
      </header>

      <section className="card-mc flex flex-col items-center justify-center p-10 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-3xl bg-brand-100 text-brand-600 shadow-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-ink-900">Espace Réparateur</h2>
        <p className="mt-2 max-w-md text-ink-600">
          Les fonctionnalités de gestion des demandes de réparation et d'intervention seront bientôt disponibles.
        </p>
      </section>
    </>
  );
}
