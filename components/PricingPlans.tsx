'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, LayoutDashboard } from 'lucide-react';
import { PLANS, planLabel, type BillingCycle } from '@/lib/plans';
import { OWNER_SUBSCRIBE_URL } from '@/lib/config';
import { useOwnerStatus } from '@/lib/use-owner-status';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/lib/auth-modal-context';

export function PricingPlans() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const { user } = useAuth();
  const { openAuth } = useAuthModal();
  const { plan: currentPlan, isPaidOwner } = useOwnerStatus();

  function priceText(plan: typeof PLANS[number]): { big: string; sub: string } {
    if (plan.monthly === 0) return { big: '$0', sub: 'forever' };
    if (cycle === 'monthly') return { big: `$${plan.monthly}`, sub: '/month' };
    return { big: `$${plan.annual}`, sub: '/year' };
  }

  function ctaFor(planId: string, isCurrent: boolean) {
    if (isCurrent) {
      return (
        <button
          type="button"
          disabled
          className="w-full cursor-default rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-400"
        >
          Current plan
        </button>
      );
    }
    // Not signed in → prompt sign-in first (so App 1 recognises the same account).
    if (!user) {
      return (
        <button
          type="button"
          onClick={() => openAuth('signin')}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
            planId === 'owner'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Get started
        </button>
      );
    }
    // Signed in → send to App 1 Subscriptions to pick + pay.
    return (
      <a
        href={OWNER_SUBSCRIBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-semibold transition-colors ${
          planId === 'owner'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        {planId === 'free' ? 'Get started' : 'Choose plan'}
        <ArrowRight className="h-4 w-4" />
      </a>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          List your property on RentAgenda
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
          Reach renters directly and manage everything from one dashboard. Choose the plan that fits your portfolio.
        </p>
      </div>

      {/* Already an owner banner */}
      {isPaidOwner && (
        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
          <p className="text-sm font-medium text-blue-800">
            You’re on the <strong>{planLabel(currentPlan)}</strong> plan. Manage your properties in AgendaRent.
          </p>
          <a
            href={OWNER_SUBSCRIBE_URL.replace('/Subscriptions', '')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to AgendaRent
          </a>
        </div>
      )}

      {/* Billing cycle toggle */}
      <div className="mt-8 flex items-center justify-center">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setCycle('monthly')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              cycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setCycle('annual')}
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              cycle === 'annual' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Annual
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              cycle === 'annual' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
            }`}>
              2 months free
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;
          const { big, sub } = priceText(plan);
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                plan.popular ? 'border-blue-200 ring-2 ring-blue-500' : 'border-slate-100'
              }`}
            >
              {plan.popular && (
                <span className="absolute right-5 top-0 -translate-y-1/2 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Popular
                </span>
              )}

              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-slate-100">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{plan.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">{big}</span>
                <span className="text-sm text-slate-400">{sub}</span>
              </div>
              {cycle === 'annual' && plan.monthly > 0 && (
                <p className="mt-1 text-xs text-emerald-600">
                  ${(plan.annual / 12).toFixed(0)}/mo billed annually
                </p>
              )}

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
                {plan.limitations?.map(l => (
                  <li key={l} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="mt-0.5 shrink-0">×</span>
                    {l}
                  </li>
                ))}
              </ul>

              <div className="mt-6">{ctaFor(plan.id, isCurrent)}</div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Plans, billing, and payment are managed securely in AgendaRent. You can change or cancel anytime.
      </p>

      <div className="mt-6 text-center">
        <Link href="/listings" className="text-sm font-medium text-blue-600 hover:underline">
          ← Back to browsing
        </Link>
      </div>
    </div>
  );
}
