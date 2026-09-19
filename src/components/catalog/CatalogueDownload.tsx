'use client';

import { useTranslations } from 'next-intl';

interface Props {
  dataUri: string;
  productName: string;
}

export function CatalogueDownload({ dataUri, productName }: Props) {
  const t = useTranslations('product');

  function handleDownload() {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `${productName.replace(/[^a-zA-Z0-9\u0600-\u06FF ]/g, '_')}_catalogue.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="group inline-flex items-center gap-3 rounded-2xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 px-5 py-4 text-sm font-semibold text-sky-700 shadow-sm transition-all hover:border-sky-300 hover:shadow-md hover:from-sky-100 hover:to-blue-100 active:scale-[0.98]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-card transition-transform group-hover:scale-110">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
      </span>
      <span className="flex flex-col items-start">
        <span className="text-sky-800">{t('downloadCatalogue')}</span>
        <span className="text-xs font-normal text-sky-500">PDF</span>
      </span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ms-auto text-sky-400 transition-transform group-hover:translate-y-0.5" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  );
}
