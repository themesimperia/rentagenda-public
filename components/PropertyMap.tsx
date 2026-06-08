'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { mapEmbedUrl } from '@/lib/format';

interface PropertyMapProps {
  lat: number | null;
  lng: number | null;
  address: string;
}

export function PropertyMap({ lat, lng, address }: PropertyMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat != null && lng != null ? { lat, lng } : null,
  );
  const [loading, setLoading] = useState(lat == null || lng == null);

  useEffect(() => {
    // Already have coords from Firestore — nothing to do.
    if (lat != null && lng != null) return;
    if (!address.trim()) { setLoading(false); return; }

    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en', 'User-Agent': 'RentAgenda/1.0' },
      },
    )
      .then(r => r.json())
      .then((data: Array<{ lat: string; lon: string }>) => {
        if (data[0]) setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [lat, lng, address]);

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-slate-200">
        {loading ? (
          <div className="flex h-[200px] items-center justify-center bg-slate-50">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : coords ? (
          <iframe
            title="Approximate location"
            src={mapEmbedUrl(coords.lat, coords.lng)}
            width="100%"
            height="200"
            className="border-0"
            loading="lazy"
          />
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400">
            <MapPin className="h-8 w-8 text-slate-300" />
            <span className="text-sm">Map not available</span>
          </div>
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {coords
            ? 'Approximate location — exact address shared after inquiry.'
            : address || 'No address provided.'}
        </p>
        {address && (
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 text-xs text-blue-500 hover:underline"
          >
            Open in Maps <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
