'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface PromptInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const SUGGESTION_PILLS = [
  'Sloth on a skateboard',
  'Rocket cat',
  'Butterfly in a car',
];

export function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      await onGenerate(prompt);
    }
  };

  const handlePillClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-[8px] w-full">
        {/* Card Header */}
        <div className="flex flex-col items-center gap-[6px] p-[24px]">
          <h1 className="font-semibold text-[24px] leading-none text-slate-950 tracking-[-0.144px] text-center w-full">
            Enter your prompt below
          </h1>
        </div>

        {/* Input Section */}
        <div className="px-[24px] py-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Astro cat surfing..."
                disabled={isLoading}
                className="bg-white border border-slate-200 h-[36px] px-[12px] py-[8px] rounded-[6px] text-[14px] leading-[20px] text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed w-full"
              />
            </div>

            {/* Suggestion Pills Section */}
            <div className="flex flex-col items-center px-[6px] py-[10px]">
              <div className="flex gap-[10px] items-center">
                {SUGGESTION_PILLS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handlePillClick(suggestion)}
                    disabled={isLoading}
                    className="bg-slate-100 h-[24px] px-[10px] py-[4px] rounded-[8px] flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-normal text-[12px] leading-[20px] text-slate-900 tracking-[-0.072px] whitespace-nowrap">
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Button Section */}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="bg-slate-900 h-[40px] px-[16px] rounded-[6px] flex items-center justify-center gap-[8px] w-full hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-slate-50" />
                    <span className="font-medium text-[14px] leading-[20px] text-slate-50 tracking-[-0.084px]">
                      Generating...
                    </span>
                  </>
                ) : (
                  <span className="font-medium text-[14px] leading-[20px] text-slate-50 tracking-[-0.084px]">
                    Generate custom emoji
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

