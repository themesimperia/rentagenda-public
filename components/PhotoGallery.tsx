'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoGalleryProps {
  photos: string[];
  title: string;
  /**
   * "row"   — main photo + 4-thumbnail row (default)
   * "panel" — big photo left + 2 stacked thumbnails right (detail side-panel)
   * "page"  — big photo left + 2×2 thumbnail grid right (full listing page)
   */
  variant?: 'row' | 'panel' | 'page';
}

export function PhotoGallery({ photos, title, variant = 'row' }: PhotoGalleryProps) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        No photos available
      </div>
    );
  }

  return (
    <>
      {variant === 'page' ? (
        /* ── Full-page hero: big left + 2×2 grid right ─────────────── */
        <div className="grid h-[420px] grid-cols-[3fr_2fr] gap-2 overflow-hidden rounded-2xl">
          {/* Main photo */}
          <div
            className="relative h-full cursor-pointer overflow-hidden bg-slate-100"
            onClick={() => setLightbox(0)}
          >
            <Image
              src={photos[0]}
              alt={title}
              fill
              className="object-cover transition-opacity hover:opacity-95"
              sizes="(max-width: 1280px) 60vw, 800px"
              priority
            />
          </div>
          {/* 2×2 thumbnail grid */}
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="relative cursor-pointer overflow-hidden bg-slate-100"
                onClick={() => setLightbox(Math.min(i, photos.length - 1))}
              >
                {photos[i] ? (
                  <Image
                    src={photos[i]}
                    alt={`${title} ${i + 1}`}
                    fill
                    className="object-cover transition-opacity hover:opacity-95"
                    sizes="15vw"
                  />
                ) : (
                  <div className="h-full bg-slate-200" />
                )}
                {i === 3 && photos.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                    +{photos.length - 5} more
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : variant === 'panel' ? (
        <div className="grid h-56 grid-cols-[2fr_1fr] gap-1">
          {/* Main photo */}
          <div
            className="relative cursor-pointer overflow-hidden rounded-tl-2xl rounded-bl-2xl bg-slate-100"
            onClick={() => setLightbox(0)}
          >
            <Image
              src={photos[0]}
              alt={title}
              fill
              className="object-cover transition-opacity hover:opacity-95"
              sizes="(max-width: 1280px) 60vw, 400px"
              priority
            />
          </div>
          {/* 2 stacked thumbnails */}
          <div className="flex flex-col gap-1">
            <div
              className="relative flex-1 cursor-pointer overflow-hidden rounded-tr-2xl bg-slate-100"
              onClick={() => setLightbox(1)}
            >
              {photos[1] ? (
                <Image
                  src={photos[1]}
                  alt={`${title} 2`}
                  fill
                  className="object-cover transition-opacity hover:opacity-95"
                  sizes="20vw"
                />
              ) : (
                <div className="h-full bg-slate-200" />
              )}
            </div>
            <div
              className="relative flex-1 cursor-pointer overflow-hidden rounded-br-2xl bg-slate-100"
              onClick={() => setLightbox(2)}
            >
              {photos[2] ? (
                <Image
                  src={photos[2]}
                  alt={`${title} 3`}
                  fill
                  className="object-cover transition-opacity hover:opacity-95"
                  sizes="20vw"
                />
              ) : (
                <div className="h-full bg-slate-200" />
              )}
              {photos.length > 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                  +{photos.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {/* Main photo */}
          <div
            className="relative aspect-[16/9] w-full cursor-pointer overflow-hidden rounded-xl bg-slate-100"
            onClick={() => setLightbox(0)}
          >
            <Image
              src={photos[0]}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 800px"
              priority
            />
          </div>
          {/* Thumbnail row */}
          {photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {photos.slice(1, 5).map((photo, i) => (
                <div
                  key={i}
                  className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-slate-100"
                  onClick={() => setLightbox(i + 1)}
                >
                  <Image
                    src={photo}
                    alt={`${title} photo ${i + 2}`}
                    fill
                    className="object-cover transition-opacity hover:opacity-90"
                    sizes="25vw"
                  />
                  {i === 3 && photos.length > 5 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 font-medium text-white">
                      +{photos.length - 5}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-white/10"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/10"
            onClick={e => { e.stopPropagation(); setLightbox(prev => Math.max(0, (prev ?? 0) - 1)); }}
            disabled={lightbox === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div
            className="relative h-[80vh] w-[90vw]"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={photos[lightbox]}
              alt={`${title} photo ${lightbox + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/10"
            onClick={e => { e.stopPropagation(); setLightbox(prev => Math.min(photos.length - 1, (prev ?? 0) + 1)); }}
            disabled={lightbox === photos.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <p className="absolute bottom-4 text-sm text-white/60">
            {lightbox + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
