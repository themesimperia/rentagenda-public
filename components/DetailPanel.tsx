'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin, Bed, Bath, Maximize2, Home, CheckCircle2, CalendarClock, CalendarCheck, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhotoGallery } from '@/components/PhotoGallery';
import { InquiryForm } from '@/components/InquiryForm';
import { propertyTypeLabel, termLabel, formatPrice, mapEmbedUrl, availability } from '@/lib/format';
import type { PublicListing } from '@/lib/types';

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

type Tab = 'overview' | 'about';

function FeaturePill({ icon: Icon, label }: { icon: typeof Bed; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
      <Icon className="h-4 w-4 text-blue-600" />
      {label}
    </span>
  );
}

export function DetailPanel({
  listing,
  permalink,
}: {
  listing: PublicListing;
  /** When set, the title links to the standalone page (dashboard use). */
  permalink?: string;
}) {
  const [tab, setTab] = useState<Tab>('overview');
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const avail = availability(listing);
  const ownerName = listing.owner_name?.trim();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="p-4">
        <PhotoGallery photos={listing.photos} title={listing.title} />
      </div>

      <div className="space-y-4 px-5 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {permalink ? (
              <Link href={permalink} className="block">
                <h2 className="truncate text-xl font-bold text-slate-900 hover:text-blue-600">
                  {listing.title}
                </h2>
              </Link>
            ) : (
              <h2 className="text-xl font-bold text-slate-900">{listing.title}</h2>
            )}
            {listing.address_public && (
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                {listing.address_public}
              </p>
            )}
          </div>
          <p className="shrink-0 text-right text-lg font-bold text-slate-900">
            {formatPrice(listing.price, listing.currency)}
            <span className="block text-xs font-normal text-slate-400">/month</span>
          </p>
        </div>

        {/* Availability */}
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
            avail.tone === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {avail.tone === 'green' ? (
            <CalendarCheck className="h-4 w-4 shrink-0" />
          ) : (
            <CalendarClock className="h-4 w-4 shrink-0" />
          )}
          {avail.available
            ? 'Available now'
            : avail.freeDate
              ? `Occupied — ${avail.daysLeft} day${avail.daysLeft === 1 ? '' : 's'} remaining (free ${avail.freeDate})`
              : 'Currently occupied'}
        </div>

        {/* Owner */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
          {listing.owner_avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.owner_avatar} alt={ownerName || 'Owner'} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {ownerName ? initials(ownerName) : 'PO'}
            </span>
          )}
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Listed by</p>
            <p className="truncate text-sm font-semibold text-slate-700">
              {ownerName || 'Property owner'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200">
          {(['overview', 'about'] as Tab[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`-mb-px border-b-2 pb-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'overview' ? (
          <div className="space-y-4">
            {listing.description && (
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {listing.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {listing.bedrooms != null && (
                <FeaturePill icon={Bed} label={`${listing.bedrooms} Bed${listing.bedrooms !== 1 ? 's' : ''}`} />
              )}
              {listing.bathrooms != null && (
                <FeaturePill icon={Bath} label={`${listing.bathrooms} Bath${listing.bathrooms !== 1 ? 's' : ''}`} />
              )}
              {listing.size_sqm != null && (
                <FeaturePill icon={Maximize2} label={`${listing.size_sqm} m²`} />
              )}
              <FeaturePill icon={Home} label={propertyTypeLabel(listing.property_type)} />
              <FeaturePill icon={CalendarClock} label={termLabel(listing.rental_term)} />
            </div>

            {listing.amenities.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">Amenities</h3>
                <ul className="grid grid-cols-2 gap-1.5">
                  {listing.amenities.map(a => (
                    <li key={a} className="flex items-center gap-1.5 text-sm capitalize text-slate-600">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
                      {a.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-600">
            <p className="whitespace-pre-line leading-relaxed">
              {listing.description || 'No additional details provided for this property.'}
            </p>
            <dl className="grid grid-cols-2 gap-y-2">
              <dt className="text-slate-400">Property type</dt>
              <dd className="text-right font-medium text-slate-700">{propertyTypeLabel(listing.property_type)}</dd>
              <dt className="text-slate-400">Rental term</dt>
              <dd className="text-right font-medium text-slate-700">{termLabel(listing.rental_term)}</dd>
              {listing.size_sqm != null && (
                <>
                  <dt className="text-slate-400">Size</dt>
                  <dd className="text-right font-medium text-slate-700">{listing.size_sqm} m²</dd>
                </>
              )}
            </dl>
          </div>
        )}

        {/* CTA */}
        {inquiryOpen ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Request a viewing</h3>
              <button
                type="button"
                onClick={() => setInquiryOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close inquiry form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <InquiryForm listing={listing} />
          </div>
        ) : (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
            onClick={() => setInquiryOpen(true)}
          >
            Request a viewing
          </Button>
        )}

        {/* Map */}
        {listing.lat != null && listing.lng != null && (
          <div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <iframe
                title="Approximate location"
                src={mapEmbedUrl(listing.lat, listing.lng)}
                width="100%"
                height="200"
                className="border-0"
                loading="lazy"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Exact address shared after inquiry.</p>
          </div>
        )}
      </div>
    </div>
  );
}
