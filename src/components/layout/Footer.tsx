import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t('sections.platform'),
      links: [
        { href: '/#how',       label: t('links.howItWorks') },
        { href: '/catalog',    label: t('links.about') },
        { href: '/careers',    label: t('links.careers') },
        { href: '/press',      label: t('links.press') },
      ],
    },
    {
      title: t('sections.legal'),
      links: [
        { href: '/legal/privacy', label: t('links.privacy') },
        { href: '/legal/terms',   label: t('links.terms') },
        { href: '/legal/cookies', label: t('links.cookies') },
        { href: '/legal/refund',  label: t('links.refund') },
      ],
    },
    {
      title: t('sections.support'),
      links: [
        { href: '/help',    label: t('links.help') },
        { href: '/contact', label: t('links.contact') },
        { href: '/faq',     label: t('links.faq') },
      ],
    },
  ];

  const socials = [
    { href: 'https://facebook.com',  label: 'Facebook',  d: 'M13.5 21v-7.5H16l.5-3h-3V8.25c0-.87.3-1.5 1.5-1.5H17V4.12c-.3-.04-1.34-.12-2.47-.12-2.44 0-4.03 1.48-4.03 4.2v2.3H8v3h2.5V21' },
    { href: 'https://instagram.com', label: 'Instagram', d: 'M12 2.5c2.6 0 2.9 0 3.9.06 1 .04 1.6.2 2 .36.5.2.8.45 1.2.84.4.4.65.7.84 1.2.16.4.32 1 .36 2 .05 1 .06 1.3.06 3.9s0 2.9-.06 3.9c-.04 1-.2 1.6-.36 2-.2.5-.45.8-.84 1.2-.4.4-.7.65-1.2.84-.4.16-1 .32-2 .36-1 .05-1.3.06-3.9.06s-2.9 0-3.9-.06c-1-.04-1.6-.2-2-.36-.5-.2-.8-.45-1.2-.84-.4-.4-.65-.7-.84-1.2-.16-.4-.32-1-.36-2-.05-1-.06-1.3-.06-3.9s0-2.9.06-3.9c.04-1 .2-1.6.36-2 .2-.5.45-.8.84-1.2.4-.4.7-.65 1.2-.84.4-.16 1-.32 2-.36 1-.05 1.3-.06 3.9-.06zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm5.3-3.4a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z' },
    { href: 'https://linkedin.com',  label: 'LinkedIn',  d: 'M5 3.5A1.5 1.5 0 106.5 5 1.5 1.5 0 005 3.5zM3.75 8h2.5v12h-2.5zm5 0h2.4v1.65h.03c.34-.63 1.17-1.3 2.4-1.3 2.57 0 3.04 1.7 3.04 3.9V20h-2.5v-5.3c0-1.27-.03-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.81V20h-2.5z' },
  ];

  return (
    <footer className="mt-auto bg-ink-900 text-ink-300">
      <div className="container-mc py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" aria-label="MediConnect">
              <Logo withText textColor="white" size={44} />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-400">
              {t('tagline')}
            </p>

            <div className="mt-6">
              <div className="mb-3 text-sm font-semibold text-white">
                {t('sections.follow')}
              </div>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-ink-300 ring-1 ring-white/10 transition hover:bg-brand-500 hover:text-white hover:ring-brand-500"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d={s.d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div className="mb-4 text-sm font-semibold text-white">
                {col.title}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-ink-400 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <div className="text-xs text-ink-500">
            {t('copyright', { year })}
          </div>
          <div className="text-xs text-ink-500">
            Made with ♥ in Algeria 🇩🇿
          </div>
        </div>
      </div>
    </footer>
  );
}
