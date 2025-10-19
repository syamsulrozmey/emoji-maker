'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock } from 'lucide-react';
import { PRICING_TIERS, PricingTier } from '@/lib/pricing';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits?: number;
  currentTier?: string | null;
}

// Map tier names to badge labels
const TIER_BADGES: Record<PricingTier, string> = {
  starter_pack: 'PLUS',
  pro_pack: 'PRO',
  pro_monthly: 'SUBSCRIPTION',
};

export function UpgradeModal({ isOpen, onClose, currentCredits = 0, currentTier = null }: UpgradeModalProps) {
  const [loadingTier, setLoadingTier] = useState<PricingTier | null>(null);

  const handleSelectPlan = async (tier: PricingTier) => {
    setLoadingTier(tier);
    
    try {
      // Call checkout API
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
        alert('Failed to initiate checkout. Please try again.');
        setLoadingTier(null);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to initiate checkout. Please try again.');
      setLoadingTier(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto p-12 relative" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl font-light"
        >
          ×
        </button>

        {/* Header */}
        <div className="mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-3">Pricing</h2>
          <p className="text-gray-500 text-lg">Check out our affordable pricing plans.</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(Object.entries(PRICING_TIERS) as [PricingTier, typeof PRICING_TIERS[PricingTier]][]).map(([tier, info]) => (
            <Card
              key={tier}
              className="relative p-8 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Badge */}
              <div className="inline-block mb-6">
                <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded-md uppercase">
                  {TIER_BADGES[tier]}
                </span>
              </div>

              {/* Current Plan Indicator - Only show for subscription tiers */}
              {tier === currentTier && info.type === 'subscription' && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    CURRENT
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-bold text-gray-900">${info.price}</span>
                </div>
                {info.type === 'subscription' && (
                  <p className="text-gray-500 text-base">Per month</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {info.features.map((feature) => {
                  const statusBadgeMap = {
                    planned: { label: 'Planned', color: 'bg-purple-100 text-purple-700' },
                    in_development: { label: 'In Dev', color: 'bg-blue-100 text-blue-700' },
                    coming_soon: { label: 'Coming Soon', color: 'bg-amber-100 text-amber-700' },
                  };

                  return (
                    <li key={feature.id} className="flex items-start gap-3">
                      {feature.available ? (
                        <Check className="w-5 h-5 shrink-0 mt-0.5 text-gray-900" />
                      ) : (
                        <Clock className="w-5 h-5 shrink-0 mt-0.5 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <span className={`text-sm leading-relaxed ${feature.available ? 'text-gray-600' : 'text-gray-400'}`}>
                          {feature.label}
                        </span>
                        {!feature.available && (
                          <div className="flex items-center gap-2 mt-1">
                            {feature.status && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${statusBadgeMap[feature.status]?.color || 'bg-gray-100 text-gray-700'}`}
                              >
                                {statusBadgeMap[feature.status]?.label || feature.status}
                              </Badge>
                            )}
                            {feature.eta && (
                              <span className="text-xs text-gray-400">
                                ETA: {feature.eta}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Button */}
              <Button
                onClick={() => handleSelectPlan(tier)}
                disabled={loadingTier !== null || (tier === currentTier && info.type === 'subscription')}
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {tier === currentTier && info.type === 'subscription'
                  ? 'Current Plan' 
                  : loadingTier === tier 
                  ? 'Processing...' 
                  : info.type === 'one_time'
                  ? 'Add More Credits'
                  : 'Subscribe Monthly'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

