import { ShieldCheck, BadgeDollarSign, MessageSquare, Search } from 'lucide-react';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Verified owners',
    body: 'Every listing comes straight from a real, verified property owner — no fake posts.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Zero agent fees',
    body: 'Deal directly with owners and skip the commission. Browsing is always free.',
  },
  {
    icon: MessageSquare,
    title: 'Direct contact',
    body: 'Message owners and request viewings with no middleman in between.',
  },
  {
    icon: Search,
    title: 'Smart search',
    body: 'Filter by location, price, type, and term — and save searches to your dashboard.',
  },
];

export function ValueProps() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">Why RentAgenda</h2>
        <p className="mt-2 text-center text-slate-500">A simpler, fairer way to rent.</p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(v => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{v.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
