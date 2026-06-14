import { Search, MessageSquare, KeyRound } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    title: 'Search listings',
    body: 'Browse homes posted directly by verified owners — filter by location, price, type, and term.',
  },
  {
    icon: MessageSquare,
    title: 'Contact the owner',
    body: 'Message or request a viewing directly. No agents, no middlemen, no hidden fees.',
  },
  {
    icon: KeyRound,
    title: 'Move in',
    body: 'Agree the terms with the owner and move into your next home.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900">How does RentAgenda work?</h2>
        <p className="mt-2 text-center text-slate-500">
          Renting directly from owners, in three simple steps.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm"
              >
                <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
