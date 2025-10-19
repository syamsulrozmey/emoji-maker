import { Bot, Download, Folder, HeartHandshake, Briefcase, Zap } from 'lucide-react';

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; ring: string; text: string }> = {
    slate: { bg: 'bg-slate-500/15', ring: 'ring-slate-500/30', text: 'text-slate-300' },
    emerald: { bg: 'bg-emerald-500/15', ring: 'ring-emerald-500/30', text: 'text-emerald-300' },
    blue: { bg: 'bg-blue-500/15', ring: 'ring-blue-500/30', text: 'text-blue-300' },
    amber: { bg: 'bg-amber-500/15', ring: 'ring-amber-500/30', text: 'text-amber-300' },
    rose: { bg: 'bg-rose-500/15', ring: 'ring-rose-500/30', text: 'text-rose-300' },
    indigo: { bg: 'bg-indigo-500/15', ring: 'ring-indigo-500/30', text: 'text-indigo-300' }
  };
  return colors[color] || colors.slate; // Fallback to slate if color not found
};

export function Features() {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Generation',
      description: 'Type "depressed avocado" or "corporate synergy vibes." We\'ll make it tiny and square. Is this helping anyone? Unclear. Will you do it anyway? Absolutely.',
      color: 'slate'
    },
    {
      icon: Download,
      title: 'PNG + Metadata',
      description: 'We embed metadata no one will ever read. Prompt, timestamp, licence. It\'s all there. You\'ll download it, use it once, and forget about it. Tale as old as time.',
      color: 'emerald'
    },
    {
      icon: Folder,
      title: 'Folder Organisation',
      description: 'Sort your emojis into folders. You\'ll create "Work" and "Personal." Both will have the same nonsense emojis. This feature exists because we had to ship something.',
      color: 'blue'
    },
    {
      icon: HeartHandshake,
      title: 'Like & Favourite',
      description: 'Heart your favourites. Star the ones you pretend you\'ll use in real projects. Create a collection you\'ll never look at again. We\'re not judging. (We are a bit.)',
      color: 'amber'
    },
    {
      icon: Briefcase,
      title: 'Commercial Use',
      description: 'Yeah sure, use them commercially. Put them in your SaaS nobody\'s heard of. Your landing page that gets 12 visitors a month. We believe in you. (Sort of.)',
      color: 'rose'
    },
    {
      icon: Zap,
      title: 'Instant Generation',
      description: '3-5 seconds per emoji. Just enough time to question your life choices. Not enough time to stop yourself from generating another one. The perfect trap.',
      color: 'indigo'
    }
  ];

  return (
    <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const colors = getColorClasses(feature.color);
          
          return (
            <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.07] transition">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-md ${colors.bg} ring-1 ${colors.ring} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
                </div>
                <h3 className="text-base font-semibold tracking-tight">{feature.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

