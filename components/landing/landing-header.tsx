'use client';

import Link from 'next/link';
import { LogIn, Wand2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export function LandingHeader() {
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
              <span className="text-xs font-semibold tracking-tight">EMJ</span>
            </div>
            <span className="hidden sm:inline text-sm text-slate-400">Custom emojis. Because obviously.</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#gallery" className="text-sm text-slate-300 hover:text-white transition-colors">Gallery</a>
            <a href="#testimonials" className="text-sm text-slate-300 hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="text-sm text-slate-300 hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <Link href="/dashboard" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm bg-slate-900 hover:bg-slate-800 text-white ring-1 ring-slate-700/50 transition">
                <Wand2 className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden sm:inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-slate-200 hover:text-white hover:bg-white/5 ring-1 ring-white/10 transition">
                  <LogIn className="w-4 h-4" />
                  Sign in
                </Link>
                <Link href="/sign-up" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm bg-orange-700 hover:bg-orange-600 text-white ring-1 ring-orange-600/50 transition">
                  <Wand2 className="w-4 h-4" />
                  Try free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

