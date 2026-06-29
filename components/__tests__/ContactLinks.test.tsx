/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactLinks } from '@/components/ContactLinks';
import type { ListingContact } from '@/lib/types';

const contacts: ListingContact[] = [
  { type: 'phone', value: '+34 600 700 800', href: 'tel:+34600700800' },
  { type: 'instagram', value: 'yura', href: 'https://instagram.com/yura' },
];

describe('ContactLinks', () => {
  it('renders social links with the correct href and opens in a new tab', () => {
    render(<ContactLinks contacts={contacts} />);
    const ig = screen.getByRole('link', { name: /instagram/i });
    expect(ig).toHaveAttribute('href', 'https://instagram.com/yura');
    expect(ig).toHaveAttribute('target', '_blank');
    expect(ig).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('masks the phone number until clicked, then reveals a tel: link', () => {
    render(<ContactLinks contacts={contacts} />);

    // Masked: rendered as a button (not a link); the full number is not shown.
    const showBtn = screen.getByRole('button', { name: /show phone number/i });
    expect(screen.queryByText('+34 600 700 800')).toBeNull();
    expect(showBtn.textContent).toContain('•');
    expect(showBtn.textContent).toContain('00'); // last two digits stay visible

    // Reveal on click → becomes a tel: link showing the real number.
    fireEvent.click(showBtn);
    const tel = screen.getByRole('link', { name: /^phone$/i });
    expect(tel).toHaveAttribute('href', 'tel:+34600700800');
    expect(screen.getByText('+34 600 700 800')).toBeInTheDocument();
  });

  it('renders nothing when there are no contacts', () => {
    const { container } = render(<ContactLinks contacts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
