'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Bed, Bath, Maximize2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { PublicListing } from '@/lib/types';

type PinnedListing = PublicListing & { lat: number; lng: number };

/** A price "pill" marker (like Zillow/Airbnb) instead of the default teardrop —
 * avoids the Leaflet missing-icon bundler issue and reads better on a listings
 * map. Turns blue when the listing is selected or hovered in the list. */
function priceIcon(label: string, active: boolean) {
  const cls = active ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white';
  return L.divIcon({
    className: 'listing-price-pin',
    html: `<span class="inline-flex whitespace-nowrap items-center rounded-full ${cls} px-2.5 py-1 text-xs font-bold shadow-md ring-1 ring-black/10">${label}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 12],
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

/** Pans to and opens the popup of the selected listing (e.g. clicked in the list). */
function SelectionController({
  selectedId,
  pins,
  markerRefs,
}: {
  selectedId: string | null;
  pins: PinnedListing[];
  markerRefs: React.RefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const listing = pins.find(p => p.id === selectedId);
    const marker = markerRefs.current?.get(selectedId);
    if (!listing) return;
    map.panTo([listing.lat, listing.lng]);
    marker?.openPopup();
  }, [selectedId, pins, markerRefs, map]);
  return null;
}

export default function ListingsMap({
  listings,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: {
  listings: PublicListing[];
  selectedId: string | null;
  hoveredId?: string | null;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}) {
  const pins = useMemo(
    () => listings.filter((l): l is PinnedListing => l.lat != null && l.lng != null),
    [listings],
  );
  const points = useMemo<[number, number][]>(() => pins.map(l => [l.lat, l.lng]), [pins]);
  const center: [number, number] = points[0] ?? [20, 0];
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

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
      <SelectionController selectedId={selectedId} pins={pins} markerRefs={markerRefs} />
      {pins.map(l => {
        const active = l.id === selectedId || l.id === hoveredId;
        const photo = l.photos[0];
        return (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={priceIcon(formatPrice(l.price, l.currency), active)}
            zIndexOffset={active ? 1000 : 0}
            ref={m => {
              if (m) markerRefs.current.set(l.id, m);
              else markerRefs.current.delete(l.id);
            }}
            eventHandlers={{
              click: () => onSelect(l.id),
              mouseover: () => onHover?.(l.id),
              mouseout: () => onHover?.(null),
            }}
          >
            <Popup>
              <div className="w-[220px]">
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={l.title}
                    className="mb-2 h-28 w-full rounded-md object-cover"
                  />
                )}
                <p className="text-sm font-bold text-blue-600">
                  {formatPrice(l.price, l.currency)}
                  <span className="text-xs font-normal text-slate-400"> /month</span>
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{l.title}</p>
                {l.address_public && (
                  <p className="truncate text-xs text-slate-500">{l.address_public}</p>
                )}
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  {l.bedrooms != null && (
                    <span className="flex items-center gap-0.5"><Bed className="h-3.5 w-3.5" /> {l.bedrooms}</span>
                  )}
                  {l.bathrooms != null && (
                    <span className="flex items-center gap-0.5"><Bath className="h-3.5 w-3.5" /> {l.bathrooms}</span>
                  )}
                  {l.size_sqm != null && (
                    <span className="flex items-center gap-0.5"><Maximize2 className="h-3.5 w-3.5" /> {l.size_sqm} m²</span>
                  )}
                </div>
                <Link
                  href={`/listing/${l.id}`}
                  className="mt-1.5 inline-block text-xs font-medium text-blue-600 hover:underline"
                >
                  View details →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
