'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import type { PublicListing } from '@/lib/types';

type PinnedListing = PublicListing & { lat: number; lng: number };

/** A price "pill" marker instead of the default teardrop icon — avoids the
 * classic Leaflet missing-icon bundler issue and reads better on a listings map. */
function priceIcon(label: string, selected: boolean) {
  const cls = selected
    ? 'bg-blue-600 text-white border-blue-600'
    : 'bg-white text-slate-800 border-slate-300';
  return L.divIcon({
    className: 'listing-price-pin',
    html: `<span class="inline-flex whitespace-nowrap items-center rounded-full border ${cls} px-2 py-1 text-xs font-semibold shadow-md">${label}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 14],
  });
}

/** Fits the map to all markers whenever the set of points changes. */
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(points, { padding: [48, 48] });
    }
  }, [map, points]);
  return null;
}

export default function ListingsMap({
  listings,
  selectedId,
  onSelect,
}: {
  listings: PublicListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const pins = useMemo(
    () => listings.filter((l): l is PinnedListing => l.lat != null && l.lng != null),
    [listings],
  );
  const points = useMemo<[number, number][]>(
    () => pins.map(l => [l.lat, l.lng]),
    [pins],
  );
  const center: [number, number] = points[0] ?? [20, 0];

  return (
    <MapContainer
      center={center}
      zoom={points.length ? 12 : 2}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {pins.map(l => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={priceIcon(formatPrice(l.price, l.currency), l.id === selectedId)}
          eventHandlers={{ click: () => onSelect(l.id) }}
          zIndexOffset={l.id === selectedId ? 1000 : 0}
        >
          <Popup>
            <div className="min-w-[180px] space-y-1">
              <p className="text-sm font-semibold text-slate-900">{l.title}</p>
              {l.address_public && (
                <p className="text-xs text-slate-500">{l.address_public}</p>
              )}
              <p className="text-sm font-bold text-blue-600">
                {formatPrice(l.price, l.currency)}
                <span className="font-normal text-slate-400"> /month</span>
              </p>
              <Link
                href={`/listing/${l.id}`}
                className="inline-block text-xs font-medium text-blue-600 hover:underline"
              >
                View details →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
