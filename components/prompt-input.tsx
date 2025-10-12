'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface PromptInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

export function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      await onGenerate(prompt);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Enter your prompt below
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Astro cat surfing..."
          disabled={isLoading}
          className="w-full px-6 py-4 text-base rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white text-base font-medium rounded-lg disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate custom emoji'
          )}
        </Button>
      </form>
    </div>
  );
}

