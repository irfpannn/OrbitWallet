'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MembershipCard, getCards, CATEGORY_PRESETS } from '@/utils/storage';
import CardWidget from '@/components/CardWidget';
import { Plus, Search, Sparkles, SlidersHorizontal, Info } from 'lucide-react';

export default function Home() {
  const [cards, setCards] = useState<MembershipCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load cards from storage
    setCards(getCards());
    setLoading(false);
  }, []);

  // Filter cards by category & search query
  const filteredCards = cards.filter((card) => {
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.cardNumber.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Container */}
      <div className="max-w-md mx-auto px-4 pt-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">Orbit</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Membership Wallet
            </h1>
          </div>
          <Link
            href="/add"
            className="flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)] transition-all duration-200 active:scale-95 border border-indigo-500/20"
            aria-label="Add Card"
          >
            <Plus className="w-6 h-6" />
          </Link>
        </header>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search stores or numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/60 backdrop-blur-md rounded-2xl border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-inner"
          />
        </div>

        {/* Categories Scroller */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1.5 -mx-4 px-4 select-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              All Cards
            </button>
            {CATEGORY_PRESETS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards list */}
        {loading ? (
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[1.586/1] bg-zinc-900 animate-pulse rounded-2xl" />
            <div className="w-full aspect-[1.586/1] bg-zinc-900 animate-pulse rounded-2xl" />
          </div>
        ) : filteredCards.length > 0 ? (
          <div className="flex flex-col gap-5">
            {filteredCards.map((card) => (
              <Link key={card.id} href={`/card/${card.id}`}>
                <CardWidget card={card} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl mt-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-4 shadow-inner">
              <SlidersHorizontal className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="font-semibold text-zinc-300 text-base mb-1">No memberships found</h3>
            <p className="text-zinc-500 text-xs max-w-[240px] leading-relaxed mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? "No matching cards for current search/filter."
                : "Add your loyalty, club, or membership cards to keep them all in one place."}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <Link
                href="/add"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-[0_4px_12px_rgba(99,102,241,0.2)] active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Your First Card
              </Link>
            )}
          </div>
        )}

        {/* PWA Install Promo or simple info banner */}
        <div className="mt-12 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex gap-3 items-start">
          <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-zinc-300">Offline Access Enabled</h4>
            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
              Add OrbitWallet to your device's home screen. Open your memberships instantly in stores without network.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
