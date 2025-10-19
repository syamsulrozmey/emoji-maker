'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details 
      className="group rounded-lg border border-white/10 bg-white/5 p-4 open:bg-white/[0.07] transition"
      open={isOpen}
      onClick={(e) => {
        e.preventDefault();
        setIsOpen(!isOpen);
      }}
    >
      <summary className="flex cursor-pointer items-center justify-between text-sm text-slate-200 list-none">
        {question}
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </summary>
      <p className="mt-3 text-sm text-slate-300">{answer}</p>
    </details>
  );
}

export function FAQ() {
  const faqs = [
    {
      question: 'Why does this exist?',
      answer: 'Great question. I ask myself that daily. Someone had to build it though. That someone was me. I\'m not proud, but here we are.'
    },
    {
      question: 'Do I actually need this?',
      answer: 'No. Absolutely not. You can live a full, rich life without custom AI emojis. But you\'re still here reading this, so clearly something\'s wrong with both of us.'
    },
    {
      question: 'How does this work?',
      answer: 'You type words. AI makes picture. Picture becomes tiny. You download. It sits in your downloads folder forever. The circle of digital life.'
    },
    {
      question: 'Is this solving a real problem?',
      answer: 'Not even slightly. But neither is 90% of the internet. At least I\'m honest about being completely unnecessary. That counts for something, right? Right?'
    },
    {
      question: 'Can I use emojis commercially?',
      answer: 'Yeah sure. Slap them on your startup\'s landing page. Put them in your app. Use them in your pitch deck. Will it help? Probably not. Are you allowed? Absolutely.'
    },
    {
      question: 'What happens when I run out of credits?',
      answer: 'You buy more. Or you don\'t. Life goes on either way. The world will keep spinning. Your Slack messages will survive without a custom "concerned potato" emoji.'
    },
    {
      question: 'Will this make me more productive?',
      answer: 'It will make you exactly 0% more productive. Possibly less. You\'ll spend 20 minutes generating the perfect emoji instead of doing actual work. But hey, it\'ll look great in Slack.'
    },
    {
      question: 'Why are you still reading these?',
      answer: 'Excellent question. Probably the same reason you\'re about to buy credits. You\'re just here making questionable decisions. Join me. Welcome to the internet.'
    }
  ];

  return (
    <section id="faq" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center">FAQs (Frequently Avoided Questions)</h3>
      <div className="mt-6 space-y-3">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
}

