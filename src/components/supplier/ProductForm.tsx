'use client';

import { useState, useRef, useCallback, type FormEvent, type DragEvent, type ChangeEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import type { Category } from '@/lib/types';
import { categoryName } from '@/lib/seed';

export interface ProductFormValues {
  categoryId: string;
  brand:      string;
  nameAr:     string; nameFr: string; nameEn: string;
  descAr:     string; descFr: string; descEn: string;
  specsAr:    string[]; specsFr: string[]; specsEn: string[];
  priceDZD:   number;
  stock:      number;
  images:     string[];        // base64 data-URIs
  cataloguePdf: string | null; // base64 data-URI
}

interface Props {
  categories: Category[];
  initial?:   Partial<ProductFormValues>;
  productId?: string;
  /** API endpoint: `/api/supplier/products` for create, `/api/supplier/products/[id]` for edit. */
  submitUrl:  string;
  submitMethod: 'POST' | 'PATCH';
  /** Where to navigate on successful save. */
  redirectTo: string;
}

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5 MB
const MAX_PDF_SIZE   = 10 * 1024 * 1024;  // 10 MB

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductForm({
  categories, initial, productId, submitUrl, submitMethod, redirectTo,
}: Props) {
  const locale = useLocale();
  const router = useRouter();
  const t  = useTranslations('productCrud');

  const [values, setValues] = useState<ProductFormValues>({
    categoryId:   initial?.categoryId   ?? '',
    brand:        initial?.brand        ?? '',
    nameAr:       initial?.nameAr       ?? '',
    nameFr:       initial?.nameFr       ?? '',
    nameEn:       initial?.nameEn       ?? '',
    descAr:       initial?.descAr       ?? '',
    descFr:       initial?.descFr       ?? '',
    descEn:       initial?.descEn       ?? '',
    specsAr:      initial?.specsAr      ?? [''],
    specsFr:      initial?.specsFr      ?? [''],
    specsEn:      initial?.specsEn      ?? [''],
    priceDZD:     initial?.priceDZD     ?? 0,
    stock:        initial?.stock        ?? 0,
    images:       initial?.images       ?? [],
    cataloguePdf: initial?.cataloguePdf ?? null,
  });
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(
    initial?.cataloguePdf ? 'catalogue.pdf' : null,
  );

  // Drag state for visual feedback
  const [dragOverPdf, setDragOverPdf]     = useState(false);
  const [dragOverImages, setDragOverImages] = useState(false);

  const pdfInputRef   = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }
  function updateSpec(kind: 'specsAr' | 'specsFr' | 'specsEn', idx: number, value: string) {
    const next = [...values[kind]];
    next[idx] = value;
    update(kind, next);
  }
  function addSpec(kind: 'specsAr' | 'specsFr' | 'specsEn') {
    update(kind, [...values[kind], '']);
  }
  function removeSpec(kind: 'specsAr' | 'specsFr' | 'specsEn', idx: number) {
    update(kind, values[kind].filter((_, i) => i !== idx));
  }

  // ——— PDF handlers ———
  const handlePdfFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      setError(`PDF too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(MAX_PDF_SIZE)}.`);
      return;
    }
    setError(null);
    const dataUri = await fileToDataUri(file);
    update('cataloguePdf', dataUri);
    setPdfName(file.name);
  }, []);

  function handlePdfDrop(e: DragEvent) {
    e.preventDefault();
    setDragOverPdf(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfFile(file);
  }
  function handlePdfInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handlePdfFile(file);
    e.target.value = '';
  }
  function removePdf() {
    update('cataloguePdf', null);
    setPdfName(null);
  }

  // ——— Image handlers ———
  const handleImageFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const remaining = MAX_IMAGES - values.images.length;
    if (remaining <= 0) {
      setError(t('maxImages', { max: MAX_IMAGES }));
      return;
    }
    setError(null);
    const toProcess = arr.slice(0, remaining);
    const newImages: string[] = [];
    for (const file of toProcess) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`Image too large (${formatFileSize(file.size)}). Maximum is ${formatFileSize(MAX_IMAGE_SIZE)}.`);
        continue;
      }
      const dataUri = await fileToDataUri(file);
      newImages.push(dataUri);
    }
    if (newImages.length > 0) {
      update('images', [...values.images, ...newImages]);
    }
  }, [values.images, t]);

  function handleImageDrop(e: DragEvent) {
    e.preventDefault();
    setDragOverImages(false);
    if (e.dataTransfer.files) handleImageFiles(e.dataTransfer.files);
  }
  function handleImageInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleImageFiles(e.target.files);
    e.target.value = '';
  }
  function removeImage(idx: number) {
    update('images', values.images.filter((_, i) => i !== idx));
  }

  // ——— Submit ———
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const primaryName = values.nameAr.trim() || values.nameFr.trim() || values.nameEn.trim();
    if (!primaryName) {
      setError(locale === 'ar' ? 'يرجى إدخال اسم المنتج على الأقل بلغة واحدة' : 'Please enter the product name (at least in one language)');
      return;
    }

    setBusy(true);
    try {
      const payload = {
        ...values,
        nameAr:   values.nameAr.trim() || primaryName,
        nameFr:   values.nameFr.trim() || primaryName,
        nameEn:   values.nameEn.trim() || primaryName,
        descAr:   values.descAr.trim() || values.descFr.trim() || values.descEn.trim() || '',
        descFr:   values.descFr.trim() || values.descAr.trim() || values.descEn.trim() || '',
        descEn:   values.descEn.trim() || values.descFr.trim() || values.descAr.trim() || '',
        priceDZD: Number(values.priceDZD) || 0,
        stock:    Number(values.stock) || 0,
        specsAr:  values.specsAr.filter((s) => s.trim()),
        specsFr:  values.specsFr.filter((s) => s.trim()),
        specsEn:  values.specsEn.filter((s) => s.trim()),
      };
      const res = await fetch(submitUrl, {
        method:  submitMethod,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        let msg = body.error === 'PLAN_LIMIT_REACHED'
          ? t('planLimit', { limit: body.limit, plan: body.plan })
          : body.error ?? 'error';
        
        if (body.details) {
          if (Array.isArray(body.details)) {
            msg += ': ' + body.details.map((d: any) => `${d.path?.join('.')}: ${d.message}`).join(', ');
          } else if (typeof body.details === 'string') {
            msg += ': ' + body.details;
          } else {
            msg += ': ' + JSON.stringify(body.details);
          }
        }
        
        setError(msg);
        return;
      }
      router.push(redirectTo);
    } catch {
      setError('error');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!productId) return;
    if (!confirm(t('confirmDelete'))) return;
    setBusy(true);
    const res = await fetch(`/api/supplier/products/${productId}`, { method: 'DELETE' });
    if (res.ok) router.push('/dashboard/supplier');
    setBusy(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card-mc p-6 md:p-8">
      <div className="grid gap-6">
        {/* Basic */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">
              {t('category')} <span className="text-red-500">*</span>
            </label>
            <select
              value={values.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              required
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {categoryName(c, locale)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">
              {t('brand')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={values.brand}
              onChange={(e) => update('brand', e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        </div>

        {/* Names trilingual */}
        <fieldset>
          <legend className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-800">
            <span>{t('nameSection')}</span>
            <span className="text-red-500">*</span>
            <span className="text-xs font-normal text-ink-400">
              ({locale === 'ar' ? 'يكفي ملء لغة واحدة على الأقل' : 'At least one language required'})
            </span>
          </legend>
          <div className="grid gap-3 md:grid-cols-3">
            <TrilingualField lang="ar" label="العربيّة" value={values.nameAr} onChange={(v) => update('nameAr', v)} />
            <TrilingualField lang="fr" label="Français"  value={values.nameFr} onChange={(v) => update('nameFr', v)} />
            <TrilingualField lang="en" label="English"   value={values.nameEn} onChange={(v) => update('nameEn', v)} />
          </div>
        </fieldset>

        {/* Descriptions trilingual */}
        <fieldset>
          <legend className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-800">
            <span>{t('descSection')}</span>
            <span className="text-xs font-normal text-ink-400">
              ({locale === 'ar' ? 'اختياري' : 'Optional'})
            </span>
          </legend>
          <div className="grid gap-3 md:grid-cols-3">
            <TrilingualArea lang="ar" label="العربيّة" value={values.descAr} onChange={(v) => update('descAr', v)} />
            <TrilingualArea lang="fr" label="Français"  value={values.descFr} onChange={(v) => update('descFr', v)} />
            <TrilingualArea lang="en" label="English"   value={values.descEn} onChange={(v) => update('descEn', v)} />
          </div>
        </fieldset>

        {/* Specs — Arabic list (Phase 3.5 will sync across languages) */}
        <fieldset>
          <legend className="mb-2 flex items-center gap-2 text-sm font-bold text-ink-800">
            <span>{t('specsSection')}</span>
            <span className="text-xs font-normal text-ink-400">
              ({locale === 'ar' ? 'اختياري' : 'Optional'})
            </span>
          </legend>
          {(['specsAr', 'specsFr', 'specsEn'] as const).map((kind) => (
            <div key={kind} className="mb-4">
              <div className="mb-1 text-xs font-semibold uppercase text-ink-500">
                {kind.replace('specs', '')}
              </div>
              <div className="space-y-2">
                {values[kind].map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => updateSpec(kind, i, e.target.value)}
                      className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                    />
                    {values[kind].length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpec(kind, i)}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSpec(kind)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  + {t('addSpec')}
                </button>
              </div>
            </div>
          ))}
        </fieldset>

        {/* ═══════════ Product Images ═══════════ */}
        <fieldset>
          <legend className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-800">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-100 text-brand-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
              </svg>
            </span>
            {t('imagesSection')}
            <span className="text-xs font-normal text-ink-400">({values.images.length}/{MAX_IMAGES})</span>
          </legend>

          {/* Existing image previews */}
          {values.images.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {values.images.map((src, i) => (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-xl border-2 border-ink-200 bg-ink-50 shadow-sm transition hover:border-brand-400 hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 end-1.5 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:bg-red-600 hover:scale-110"
                    aria-label={t('removeImage')}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
                    <span className="text-[10px] font-semibold text-white">{i + 1}/{values.images.length}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload zone */}
          {values.images.length < MAX_IMAGES && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverImages(true); }}
              onDragLeave={() => setDragOverImages(false)}
              onDrop={handleImageDrop}
              onClick={() => imageInputRef.current?.click()}
              className={`
                group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300
                ${dragOverImages
                  ? 'border-brand-500 bg-brand-50 shadow-lg shadow-brand-500/10 scale-[1.01]'
                  : 'border-ink-300 bg-ink-50/50 hover:border-brand-400 hover:bg-brand-50/50 hover:shadow-md'
                }
              `}
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageInput}
                className="hidden"
              />
              <div className={`mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl transition-all duration-300 ${dragOverImages ? 'bg-brand-500 text-white scale-110' : 'bg-ink-200 text-ink-500 group-hover:bg-brand-100 group-hover:text-brand-600'}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-ink-700">{t('uploadImages')}</div>
              <div className="mt-1 text-xs text-ink-500">{t('uploadImagesHint')}</div>
            </div>
          )}
        </fieldset>

        {/* ═══════════ PDF Catalogue ═══════════ */}
        <fieldset>
          <legend className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-800">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-100 text-sky-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </span>
            {t('catalogueSection')}
          </legend>

          {values.cataloguePdf ? (
            /* PDF uploaded state */
            <div className="flex items-center gap-4 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-5 shadow-sm transition-all hover:shadow-md">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-card">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t('catalogueReady')}
                  </span>
                </div>
                <div className="mt-1 truncate text-sm font-semibold text-ink-800">{pdfName}</div>
                <div className="mt-0.5 text-xs text-ink-500">PDF</div>
              </div>
              <button
                type="button"
                onClick={removePdf}
                className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 ring-1 ring-red-200 transition hover:bg-red-100 hover:text-red-700 hover:shadow-sm"
              >
                {t('removeCatalogue')}
              </button>
            </div>
          ) : (
            /* PDF drop zone */
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOverPdf(true); }}
              onDragLeave={() => setDragOverPdf(false)}
              onDrop={handlePdfDrop}
              onClick={() => pdfInputRef.current?.click()}
              className={`
                group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300
                ${dragOverPdf
                  ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-500/10 scale-[1.01]'
                  : 'border-ink-300 bg-ink-50/50 hover:border-sky-400 hover:bg-sky-50/50 hover:shadow-md'
                }
              `}
            >
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfInput}
                className="hidden"
              />
              <div className={`mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl transition-all duration-300 ${dragOverPdf ? 'bg-sky-500 text-white scale-110' : 'bg-ink-200 text-ink-500 group-hover:bg-sky-100 group-hover:text-sky-600'}`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-ink-700">{t('uploadCatalogue')}</div>
              <div className="mt-1 text-xs text-ink-500">{t('uploadCatalogueHint')}</div>
            </div>
          )}
        </fieldset>

        {/* Price + stock */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">
              {t('price')} <span className="text-xs font-normal text-ink-400">({locale === 'ar' ? 'اختياري' : 'Optional'})</span>
            </label>
            <input
              type="number"
              min={0}
              value={values.priceDZD || ''}
              onChange={(e) => update('priceDZD', Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-800">
              {t('stock')} <span className="text-xs font-normal text-ink-400">({locale === 'ar' ? 'اختياري' : 'Optional'})</span>
            </label>
            <input
              type="number"
              min={0}
              value={values.stock || ''}
              onChange={(e) => update('stock', Number(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white shadow-card transition hover:bg-brand-600 disabled:opacity-60"
          >
            {busy ? '...' : productId ? t('update') : t('create')}
          </button>
          {productId && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy}
              className="rounded-xl bg-red-50 px-6 py-3 font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100 disabled:opacity-60"
            >
              {t('delete')}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function TrilingualField({
  lang, label, value, onChange,
}: { lang: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase text-ink-500">{label}</label>
      <input
        type="text"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
      />
    </div>
  );
}

function TrilingualArea({
  lang, label, value, onChange,
}: { lang: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-bold uppercase text-ink-500">{label}</label>
      <textarea
        rows={3}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
      />
    </div>
  );
}
