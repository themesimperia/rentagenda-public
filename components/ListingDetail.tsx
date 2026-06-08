'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin, Bed, Bath, Maximize2, Home, CheckCircle2,
  CalendarClock, CalendarCheck, ChevronLeft, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhotoGallery } from '@/components/PhotoGallery';
import { InquiryForm } from '@/components/InquiryForm';
import { PropertyMap } from '@/components/PropertyMap';
import { propertyTypeLabel, termLabel, formatPrice, availability } from '@/lib/format';
import type { PublicListing } from '@/lib/types';

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

function FeaturePill({ icon: Icon, label }: { icon: typeof Bed; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
      <Icon className="h-4 w-4 text-blue-500" />
      {label}
    </span>
  );
}

type Tab = 'overview' | 'about';

export function ListingDetail({ listing }: { listing: PublicListing }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const avail = availability(listing);
  const ownerName = listing.owner_name?.trim();

  return (
    <div className="min-h-screen bg-white">
      {/* ── Back nav ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to listings
        </Link>
      </div>

      {/* ── Hero photo grid ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <PhotoGallery photos={listing.photos} title={listing.title} variant="page" />
      </div>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">

          {/* ── Left: details ─────────────────────────────────────────── */}
          <div className="space-y-8">
            {/* Title + address */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{listing.title}</h1>
              {listing.address_public && (
                <p className="mt-2 flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                  {listing.address_public}
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex gap-8">
                {(['overview', 'about'] as Tab[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`-mb-px border-b-2 pb-3 text-sm font-medium capitalize transition-colors ${
                      tab === t
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t === 'overview' ? 'Overview' : 'About'}
                  </button>
                ))}
              </div>
            </div>

            {tab === 'overview' ? (
              <div className="space-y-6">
                {/* Description */}
                {listing.description && (
                  <div>
                    <h2 className="mb-2 text-base font-semibold text-slate-800">Description</h2>
                    <p className="whitespace-pre-line leading-relaxed text-slate-600">
                      {listing.description}
                    </p>
                  </div>
                )}

                {/* Feature pills */}
                <div>
                  <h2 className="mb-3 text-base font-semibold text-slate-800">Property details</h2>
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
                </div>

                {/* Amenities */}
                {listing.amenities.length > 0 && (
                  <div>
                    <h2 className="mb-3 text-base font-semibold text-slate-800">Amenities</h2>
                    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {listing.amenities.map(a => (
                        <li key={a} className="flex items-center gap-2 text-sm capitalize text-slate-600">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                          {a.replace(/_/g, ' ')}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {listing.description && (
                  <p className="whitespace-pre-line leading-relaxed text-slate-600">
                    {listing.description}
                  </p>
                )}
                <dl className="grid grid-cols-2 gap-y-3 text-sm sm:max-w-sm">
                  <dt className="text-slate-400">Property type</dt>
                  <dd className="font-medium text-slate-700">{propertyTypeLabel(listing.property_type)}</dd>
                  <dt className="text-slate-400">Rental term</dt>
                  <dd className="font-medium text-slate-700">{termLabel(listing.rental_term)}</dd>
                  {listing.size_sqm != null && (
                    <>
                      <dt className="text-slate-400">Size</dt>
                      <dd className="font-medium text-slate-700">{listing.size_sqm} m²</dd>
                    </>
                  )}
                  {listing.bedrooms != null && (
                    <>
                      <dt className="text-slate-400">Bedrooms</dt>
                      <dd className="font-medium text-slate-700">{listing.bedrooms}</dd>
                    </>
                  )}
                  {listing.bathrooms != null && (
                    <>
                      <dt className="text-slate-400">Bathrooms</dt>
                      <dd className="font-medium text-slate-700">{listing.bathrooms}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}

            {/* Map */}
            <div>
              <h2 className="mb-3 text-base font-semibold text-slate-800">Location</h2>
              <PropertyMap lat={listing.lat} lng={listing.lng} address={listing.address_public} />
            </div>
          </div>

          {/* ── Right: price + CTA (sticky) ───────────────────────────── */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
              {/* Price */}
              <div className="mb-4 border-b border-slate-100 pb-4">
                <p className="text-3xl font-bold text-slate-900">
                  {formatPrice(listing.price, listing.currency)}
                </p>
                <p className="mt-0.5 text-sm text-slate-400">/month</p>
              </div>

              {/* Availability */}
              <div
                className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  avail.tone === 'green'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
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
                    ? `Free from ${avail.freeDate} (${avail.daysLeft}d)`
                    : 'Currently occupied'}
              </div>

              {/* Owner */}
              <div className="mb-5 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                {listing.owner_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.owner_avatar}
                    alt={ownerName || 'Owner'}
                    className="h-9 w-9 rounded-full object-cover"
                  />
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

              {/* CTA */}
              {inquiryOpen ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">Request a viewing</h3>
                    <button
                      type="button"
                      onClick={() => setInquiryOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <InquiryForm listing={listing} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => setInquiryOpen(true)}
                  >
                    Contact
                  </Button>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setInquiryOpen(true)}
                  >
                    Request Viewing
                  </Button>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
