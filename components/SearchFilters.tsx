'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { PublicListing, PropertyType, RentalTerm } from '@/lib/types';

interface Filters {
  search: string;
  propertyType: PropertyType | 'any' | '';
  rentalTerm: RentalTerm | 'any' | '';
  minBedrooms: string;
}

const EMPTY_FILTERS: Filters = {
  search: '',
  propertyType: '',
  rentalTerm: '',
  minBedrooms: '',
};

function applyFilters(listings: PublicListing[], f: Filters): PublicListing[] {
  return listings.filter(l => {
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !l.title.toLowerCase().includes(q) &&
        !l.address_public.toLowerCase().includes(q) &&
        !l.description.toLowerCase().includes(q)
      ) return false;
    }
    if (f.propertyType && f.propertyType !== 'any' && l.property_type !== f.propertyType) return false;
    if (f.rentalTerm && f.rentalTerm !== 'any' && l.rental_term !== f.rentalTerm) return false;
    if (f.minBedrooms && f.minBedrooms !== 'any' && (l.bedrooms == null || l.bedrooms < Number(f.minBedrooms))) return false;
    return true;
  });
}

interface SearchFiltersProps {
  listings: PublicListing[];
  onFilter: (filtered: PublicListing[]) => void;
}

export function SearchFilters({ listings, onFilter }: SearchFiltersProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  useEffect(() => {
    onFilter(applyFilters(listings, filters));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings, filters]);

  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function reset() {
    setFilters(EMPTY_FILTERS);
  }

  const hasFilters =
    filters.search !== '' ||
    (filters.propertyType !== '' && filters.propertyType !== 'any') ||
    (filters.rentalTerm !== '' && filters.rentalTerm !== 'any') ||
    (filters.minBedrooms !== '' && filters.minBedrooms !== 'any');

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <div className="sm:col-span-2">
          <Label htmlFor="search" className="text-xs text-slate-500">Search</Label>
          <Input
            id="search"
            placeholder="City, title, keyword…"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
          />
        </div>

        <div>
          <Label className="text-xs text-slate-500">Property type</Label>
          <Select
            value={filters.propertyType}
            onValueChange={v => set('propertyType', (v ?? '') as PropertyType | 'any' | '')}
          >
            <SelectTrigger><SelectValue placeholder="Any type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any type</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="vacation">Vacation rental</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-slate-500">Rental term</Label>
          <Select
            value={filters.rentalTerm}
            onValueChange={v => set('rentalTerm', (v ?? '') as RentalTerm | 'any' | '')}
          >
            <SelectTrigger><SelectValue placeholder="Any term" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any term</SelectItem>
              <SelectItem value="long_term">Long term</SelectItem>
              <SelectItem value="short_term">Short term</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-slate-500">Min bedrooms</Label>
          <Select
            value={filters.minBedrooms}
            onValueChange={v => set('minBedrooms', v ?? '')}
          >
            <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={reset} className="text-slate-500">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
