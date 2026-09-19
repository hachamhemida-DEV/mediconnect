'use client';

import { useState } from 'react';

interface Props {
  images: string[];
  categoryIcon: string;
  featured: boolean;
  featuredLabel: string;
}

export function ProductGallery({ images, categoryIcon, featured, featuredLabel }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const hasImages = images.length > 0;
  const activeImage = hasImages ? images[activeIdx] : null;

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-200/60">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-ink-50 to-ink-100">
          {activeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage}
              alt=""
              className="h-full w-full object-cover transition-all duration-500"
            />
          ) : (
            <div className="grid h-full place-items-center text-8xl">
              {categoryIcon}
            </div>
          )}
          {featured && (
            <span className="absolute top-4 start-4 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-card-lg">
              ★ {featuredLabel}
            </span>
          )}
          {/* Image counter badge */}
          {images.length > 1 && (
            <span className="absolute bottom-4 end-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
              </svg>
              {activeIdx + 1}/{images.length}
            </span>
          )}
        </div>
      </div>

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`
                relative shrink-0 overflow-hidden rounded-xl transition-all duration-200
                ${i === activeIdx
                  ? 'ring-2 ring-brand-500 ring-offset-2 shadow-md scale-105'
                  : 'ring-1 ring-ink-200 opacity-70 hover:opacity-100 hover:ring-brand-300 hover:shadow-sm'
                }
              `}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-16 w-16 object-cover sm:h-20 sm:w-20"
              />
              {i === activeIdx && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-brand-500/30" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
