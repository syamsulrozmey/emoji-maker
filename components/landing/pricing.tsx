'use client';

import { CreditCard, Check, Clock } from 'lucide-react';
import Link from 'next/link';
import { PRICING_TIERS, Feature } from '@/lib/pricing';

// Humorous label overrides for marketing
const HUMOROUS_LABELS: Record<string, string> = {
  'starter_credits': '30 emoji generations you don\'t need',
  'png_export': 'PNG with metadata you\'ll ignore',
  'public_gallery_share': 'Share to gallery (nobody will see)',
  'commercial_use': 'Use commercially (as if you would)',
  'priority_email_support': 'Priority queue (10 seconds faster, wow)',
  'pro_credits': '75 emoji generations (seriously?)',
  'batch_generation': 'Batch generate 4 bad ideas at once',
  'public_gallery_analytics': 'Gallery analytics (for your 3 views)',
  'custom_prompt_library': 'Save 10 prompts you\'ll never reuse',
  'priority_support': 'Priority support (we\'ll reply slightly faster)',
  'monthly_credits': '15 credits / month (you\'ll forget to cancel)',
  'auto_renews': 'Auto-renews (you won\'t notice for months)',
};

function getFeatureLabel(feature: Feature): string {
  return HUMOROUS_LABELS[feature.id] || feature.label;
}

export function Pricing() {
  const starter = PRICING_TIERS.starter_pack;
  const pro = PRICING_TIERS.pro_pack;
  const monthly = PRICING_TIERS.pro_monthly;

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          <CreditCard className="w-3.5 h-3.5" />
          Yes, we&apos;re actually charging money for this
        </span>
        <h3 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">Choose your regret level</h3>
        <p className="mt-3 text-sm text-slate-400">
          You get 5 free credits. That should be enough to realise this is pointless. But you&apos;ll buy more anyway. It&apos;s fine. We&apos;ve all made worse financial decisions.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Starter Pack */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col">
          <h3 className="text-lg font-semibold tracking-tight">{starter.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{starter.credits} credits (you won&apos;t use them all)</p>
          <div className="mt-4">
            <span className="text-3xl font-semibold">${starter.price.toFixed(2)}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {starter.features.map((feature) => (
              <li key={feature.id} className="flex items-start gap-2">
                {feature.available ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <span>{getFeatureLabel(feature)}</span>
                  </>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-400">{getFeatureLabel(feature)}</span>
                    </div>
                    <span className="text-xs text-slate-500 ml-6">Coming Soon</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Link href="/sign-up" className="mt-6 inline-flex justify-center items-center gap-2 rounded-md bg-orange-700 hover:bg-orange-600 ring-1 ring-orange-600/50 text-white text-sm px-4 py-2 transition">
            Waste ${starter.price.toFixed(2)}
          </Link>
        </div>

        {/* Pro Pack (Most Popular) */}
        <div className="relative rounded-2xl border-2 border-slate-700/40 bg-white/5 p-5 flex flex-col shadow-[0_0_0_4px_rgba(15,23,42,0.3)]">
          <div className="absolute -top-3 right-3">
            <span className="text-[10px] font-medium tracking-tight uppercase bg-slate-900 text-white px-2 py-1 rounded-md ring-1 ring-slate-700/40">Most regretted</span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight">{pro.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{pro.credits} credits (seriously?)</p>
          <div className="mt-4">
            <span className="text-3xl font-semibold">${pro.price.toFixed(2)}</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {pro.features.map((feature) => (
              <li key={feature.id} className="flex items-start gap-2">
                {feature.available ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <span>{getFeatureLabel(feature)}</span>
                  </>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-400">{getFeatureLabel(feature)}</span>
                    </div>
                    <span className="text-xs text-slate-500 ml-6">Coming Soon</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Link href="/sign-up" className="mt-6 inline-flex justify-center items-center gap-2 rounded-md bg-orange-700 hover:bg-orange-600 ring-1 ring-orange-600/50 text-white text-sm px-4 py-2 transition">
            Waste ${pro.price.toFixed(2)}
          </Link>
        </div>

        {/* Pro Monthly */}
        <div className="relative rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col">
          <h3 className="text-lg font-semibold tracking-tight">{monthly.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{monthly.credits} credits / month (you&apos;ll forget to cancel)</p>
          <div className="mt-4">
            <span className="text-3xl font-semibold">${monthly.price.toFixed(2)}</span>
            <span className="text-xs text-slate-400">/mo • like a bad Netflix subscription</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {monthly.features.map((feature) => (
              <li key={feature.id} className="flex items-start gap-2">
                {feature.available ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                    <span>{getFeatureLabel(feature)}</span>
                  </>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-400">{getFeatureLabel(feature)}</span>
                    </div>
                    <span className="text-xs text-slate-500 ml-6">Coming Soon</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <Link href="/sign-up" className="mt-6 inline-flex justify-center items-center gap-2 rounded-md bg-white/10 hover:bg-white/15 ring-1 ring-white/15 text-sm px-4 py-2 transition">
            Subscribe ${monthly.price.toFixed(2)}/mo
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Payments processed by Stripe because even we need a serious company to handle the money. Taxes may apply. Your bank statement will judge you.
      </p>
    </section>
  );
}

