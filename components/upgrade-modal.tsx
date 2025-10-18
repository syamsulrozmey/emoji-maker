'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Sparkles } from 'lucide-react';
import { PRICING_TIERS, PricingTier } from '@/lib/pricing';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits?: number;
  currentTier?: string | null;
}

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
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-8 relative" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h2 className="text-3xl font-bold">Upgrade Your Plan</h2>
            </div>
            {currentCredits === 0 ? (
              <p className="text-gray-600 mt-2">
                You&apos;ve used all your credits. Choose a plan to continue creating amazing emojis!
              </p>
            ) : (
              <p className="text-gray-600 mt-2">
                You have {currentCredits} credit{currentCredits !== 1 ? 's' : ''} remaining. 
                Get more credits to unlock unlimited creativity!
              </p>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(PRICING_TIERS) as [PricingTier, typeof PRICING_TIERS[PricingTier]][]).map(([tier, info]) => (
              <Card
                key={tier}
                className={`relative p-6 border-2 ${
                  info.popular
                    ? 'border-blue-500 shadow-lg scale-105'
                    : 'border-gray-200'
                }`}
              >
                {info.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                {tier === currentTier && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    CURRENT PLAN
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{info.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">${info.price}</span>
                    {info.type === 'subscription' && (
                      <span className="text-gray-500">/month</span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">
                    {info.credits} credits
                    {info.type === 'subscription' && ' per month'}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {info.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(tier)}
                  disabled={loadingTier !== null || tier === currentTier}
                  className={`w-full ${
                    info.popular
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-900 hover:bg-gray-800'
                  } text-white ${tier === currentTier ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {tier === currentTier 
                    ? 'Current Plan' 
                    : loadingTier === tier 
                    ? 'Processing...' 
                    : 'Select Plan'}
                </Button>
              </Card>
            ))}
          </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>✓ Secure payment with Stripe</p>
          <p className="mt-1">✓ Cancel anytime (subscription plans)</p>
          <p className="mt-1">✓ Credits never expire (one-time purchases)</p>
        </div>
      </div>
    </div>
  );
}

