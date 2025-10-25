import { Users } from 'lucide-react';
import Image from 'next/image';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah K.',
      role: 'Definitely a real person',
      quote: 'I spent £9.99 on emoji credits instead of lunch. My priorities are finally sorted.',
      avatar: '/aivatar_cir_10.png'
    },
    {
      name: 'Marcus T.',
      role: '100% not the founder\'s mate',
      quote: 'Generated "confused spreadsheet" for a work presentation. Got promoted. Correlation unclear.',
      avatar: '/aivatar_cir_07.png'
    },
    {
      name: 'Alex P.',
      role: 'Paid actor (metaphorically)',
      quote: 'My Slack messages are now 40% custom emojis. HR asked me to stop. I bought more credits.',
      avatar: '/aivatar_cir_13.png'
    }
  ];

  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          <Users className="w-3.5 h-3.5" />
          Testimonials from our very real user base
        </span>
        <h3 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight">
          People who definitely exist say nice things
        </h3>
        <p className="mt-3 text-sm text-slate-400">
          We don&apos;t have actual users yet, so here&apos;s some testimonials for your confidence.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden ring-1 ring-white/10">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium">{testimonial.name}</p>
                <p className="text-xs text-slate-400">{testimonial.role}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">
              &quot;{testimonial.quote}&quot;
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        These testimonials are 100% made up. We have no users. You could be our first real one. Or our only one. Time will tell.
      </p>
    </section>
  );
}

