'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Sparkles, Coins, Wand2, Lock, ShieldCheck, CreditCard, Download, Folder, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function Hero() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsLoading(false);
    
    // Show sign-up prompt
    setShowSignUpPrompt(true);
  };

  const handleSignUp = () => {
    // Redirect to sign-up with the prompt as URL parameter
    const encodedPrompt = encodeURIComponent(prompt);
    router.push(`/sign-up?prompt=${encodedPrompt}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleGenerate();
    }
  };

  return (
    <>
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_-20%,rgba(15,23,42,0.5),transparent_60%)]"></div>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(30%_40%_at_80%_10%,rgba(16,185,129,0.12),transparent_60%)]"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 pt-16 sm:pt-20 lg:pt-28">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              <Zap className="w-3.5 h-3.5" />
              Another AI platform solving problems that don&apos;t exist
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
              Oh good, another emoji generator
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-slate-300">
              Because what the world really needed was AI-generated custom emojis. You don&apos;t need this. You know you don&apos;t need this. You&apos;re going to buy credits anyway.
            </p>

            {/* Prompt box */}
            <div id="try" className="mt-8 w-full max-w-2xl">
              <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 shadow-sm">
                <div className="flex items-center gap-2 rounded-lg bg-black ring-1 ring-white/10 hover:ring-white/20 transition">
                  <div className="pl-3 pr-2 text-slate-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Try: &quot;Astro cat surfing a cosmic Wi-Fi wave&quot;" 
                    className="flex-1 bg-transparent placeholder:text-slate-500 text-slate-200 text-sm sm:text-base focus:outline-none py-3"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    aria-label="Enter your emoji prompt"
                  />
                  <div className="hidden sm:flex items-center gap-3 pr-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-emerald-300/90 ring-1 ring-emerald-500/30 bg-emerald-500/10">
                      <Coins className="w-3.5 h-3.5" />
                      5 credits left
                    </span>
                    <button 
                      onClick={handleGenerate}
                      disabled={isLoading || !prompt.trim()}
                      className="inline-flex items-center gap-2 rounded-md bg-orange-700 hover:bg-orange-600 text-white text-sm px-3 py-2 ring-1 ring-orange-600/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="sm:hidden mr-2 inline-flex items-center justify-center rounded-md bg-orange-700 hover:bg-orange-600 w-9 h-9 ring-1 ring-orange-600/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>No credit card required - enjoy 5 free credits</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Commercial use allowed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust-ish row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <div className="inline-flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" />
                Stripe-powered payments
              </div>
              <div className="inline-flex items-center gap-2">
                <Download className="w-3.5 h-3.5" />
                PNG downloads with embedded metadata
              </div>
              <div className="inline-flex items-center gap-2">
                <Folder className="w-3.5 h-3.5" />
                Folder organisation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sign-up prompt dialog */}
      <AlertDialog open={showSignUpPrompt} onOpenChange={setShowSignUpPrompt}>
        <AlertDialogContent className="bg-slate-950 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Sign up to generate your emoji</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Create a free account to generate &quot;{prompt}&quot; and get 5 free credits to start making custom emojis!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-900 text-slate-200 hover:bg-slate-800 border-slate-700">
              Maybe later
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSignUp}
              className="bg-slate-900 hover:bg-slate-800 text-white ring-1 ring-slate-700/50"
            >
              Sign up now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
