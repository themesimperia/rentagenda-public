'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        No photos available
      </div>
    );
  }

  return (
    <>
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
                  className="object-cover hover:opacity-90 transition-opacity"
                  sizes="25vw"
                />
                {i === 3 && photos.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-medium">
                    +{photos.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/10"
            onClick={e => {
              e.stopPropagation();
              setLightbox(prev => Math.max(0, (prev ?? 0) - 1));
            }}
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
            onClick={e => {
              e.stopPropagation();
              setLightbox(prev => Math.min(photos.length - 1, (prev ?? 0) + 1));
            }}
            disabled={lightbox === photos.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <p className="absolute bottom-4 text-white/60 text-sm">
            {lightbox + 1} / {photos.length}
          </p>
        </div>
      )}
    </>
  );
}
