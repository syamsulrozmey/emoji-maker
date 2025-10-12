'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { PromptInput } from '@/components/prompt-input';
import { FilterTabs } from '@/components/filter-tabs';
import { EmojiGrid } from '@/components/emoji-grid';
import { Emoji } from '@/types/emoji';

export default function Home() {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [credits, setCredits] = useState(5);

  // Load emojis from localStorage on mount
  useEffect(() => {
    const savedEmojis = localStorage.getItem('emojis');
    if (savedEmojis) {
      setEmojis(JSON.parse(savedEmojis));
    }
  }, []);

  // Save emojis to localStorage whenever they change
  useEffect(() => {
    if (emojis.length > 0) {
      localStorage.setItem('emojis', JSON.stringify(emojis));
    }
  }, [emojis]);

  const handleGenerate = async (prompt: string) => {
    if (credits <= 0) {
      alert('You have no credits left. Please upgrade to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate emoji');
      }

      const data = await response.json();
      
      const newEmoji: Emoji = {
        id: Date.now().toString(),
        imageUrl: data.imageUrl,
        title: prompt,
        category: 'All',
        isLiked: false,
      };

      setEmojis((prev) => [newEmoji, ...prev]);
      setCredits((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error generating emoji:', error);
      alert('Failed to generate emoji. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (id: string) => {
    setEmojis((prev) =>
      prev.map((emoji) =>
        emoji.id === id ? { ...emoji, isLiked: !emoji.isLiked } : emoji
      )
    );
  };

  const filteredEmojis = emojis.filter((emoji) => {
    if (activeTab === 'All') return true;
    return emoji.category === activeTab;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header credits={credits} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-16">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        <div className="space-y-8">
          <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div>
            <h2 className="text-3xl font-bold mb-8">Emoji you have generated so far</h2>
            <EmojiGrid emojis={filteredEmojis} onLike={handleLike} />
          </div>
        </div>
      </main>
    </div>
  );
}
