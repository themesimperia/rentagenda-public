/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactLinks } from '@/components/ContactLinks';
import type { ListingContact } from '@/lib/types';

const contacts: ListingContact[] = [
  { type: 'phone', value: '+34600', href: 'tel:+34600' },
  { type: 'instagram', value: 'yura', href: 'https://instagram.com/yura' },
];

describe('ContactLinks', () => {
  it('renders a link per contact with the correct href and accessible label', () => {
    render(<ContactLinks contacts={contacts} />);
    const phone = screen.getByRole('link', { name: /phone/i });
    const ig = screen.getByRole('link', { name: /instagram/i });
    expect(phone).toHaveAttribute('href', 'tel:+34600');
    expect(ig).toHaveAttribute('href', 'https://instagram.com/yura');
    expect(ig).toHaveAttribute('target', '_blank');
  });

  it('renders nothing when there are no contacts', () => {
    const { container } = render(<ContactLinks contacts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
