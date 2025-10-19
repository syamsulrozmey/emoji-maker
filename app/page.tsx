'use client';

import { useUser } from '@clerk/nextjs';
import { LandingHeader } from '@/components/landing/landing-header';
import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Gallery } from '@/components/landing/gallery';
import { Testimonials } from '@/components/landing/testimonials';
import { Pricing } from '@/components/landing/pricing';
import { FAQ } from '@/components/landing/faq';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  
  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }
  
  // If user is signed in, return null - middleware will redirect to /dashboard
  if (isSignedIn) {
    return null;
  }
  
  // Show landing page for signed-out users
  return (
    <div className="min-h-screen bg-black text-slate-100">
      <LandingHeader />
      <Hero />
      <Features />
      <Gallery />
      <Testimonials />
      <Pricing />
      <FAQ />
      <LandingFooter />
    </div>
  );
}
