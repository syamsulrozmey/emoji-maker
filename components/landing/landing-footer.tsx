import { Shield, Linkedin, Github } from 'lucide-react';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
              <span className="text-xs font-semibold tracking-tight">EMJ</span>
            </div>
            <p className="text-sm text-slate-400">Solving problems that don&apos;t exist since 2025.</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#features" className="text-slate-300 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</a>
            <a href="#faq" className="text-slate-300 hover:text-white transition">FAQ</a>
            <a href="#" className="text-slate-300 hover:text-white transition">Privacy</a>
            <a href="#" className="text-slate-300 hover:text-white transition">Terms</a>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-xs text-slate-500">A side project by srozmey. Probably should&apos;ve built something useful instead.</p>
            <div className="flex items-center gap-2">
              <a 
                href="https://www.linkedin.com/in/srozmey/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="https://github.com/syamsulrozmey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5" />
            Secure checkout with Stripe
          </div>
        </div>
      </div>
    </footer>
  );
}

