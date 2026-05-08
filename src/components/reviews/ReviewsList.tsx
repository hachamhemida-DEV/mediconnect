import { prisma } from '@/lib/prisma';
import { getTranslations, getLocale } from 'next-intl/server';

export async function ReviewsList({ productId }: { productId: string }) {
  const t = await getTranslations('reviews');
  const locale = await getLocale();

  const reviews = await prisma.review.findMany({
    where:   { productId },
    include: { user: { select: { fullName: true } } },
    orderBy: { createdAt: 'desc' },
    take:    20,
  });

  if (reviews.length === 0) {
    return (
      <div className="card-mc flex flex-col items-center gap-2 p-10 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-3xl">⭐</div>
        <p className="font-semibold text-ink-800">{t('noReviews')}</p>
        <p className="text-sm text-ink-500">{t('beFirst')}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="card-mc p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-bold text-ink-900">{r.user.fullName}</div>
              <div className="mt-0.5 flex gap-0.5 text-amber-400">
                {[0,1,2,3,4].map((i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                    fill={i < r.rating ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M12 2l2.6 6.2L21 9l-5 4.3L17.2 20 12 16.8 6.8 20 8 13.3 3 9l6.4-.8L12 2z" />
                  </svg>
                ))}
              </div>
            </div>
            <time className="text-xs text-ink-400">
              {new Date(r.createdAt).toLocaleDateString(locale)}
            </time>
          </div>
          <p className="mt-3 leading-relaxed text-ink-700">{r.comment}</p>
        </li>
      ))}
    </ul>
  );
}
