'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { addCard, COLOR_PRESETS, CATEGORY_PRESETS } from '@/utils/storage';
import { ArrowLeft, Camera, Check } from 'lucide-react';

// Dynamically import Scanner to prevent SSR loading issues
const Scanner = dynamic(() => import('@/components/Scanner'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Opening camera module...</p>
      </div>
    </div>
  ),
});

export default function AddCard() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [format, setFormat] = useState<'qr' | 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39'>('code128');
  const [color, setColor] = useState(COLOR_PRESETS[0].name);
  const [category, setCategory] = useState(CATEGORY_PRESETS[0].id);
  const [notes, setNotes] = useState('');

  // Custom theme colors
  const [customStart, setCustomStart] = useState('#6366f1');
  const [customEnd, setCustomEnd] = useState('#a855f7');

  // UI state
  const [showScanner, setShowScanner] = useState(false);

  const handleScanSuccess = (decodedText: string, detectedFormat: 'qr' | 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39') => {
    setCardNumber(decodedText);
    setFormat(detectedFormat);
    setShowScanner(false);
  };

  const handleCustomColorChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setColor(`${start},${end}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!cardNumber.trim()) return;

    addCard({
      name,
      cardNumber,
      format,
      color,
      category,
      notes: notes.trim() || undefined,
    });

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-16">
      <div className="max-w-md mx-auto px-4 pt-8">
        
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors active:scale-95"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Add Membership Card</h1>
        </header>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Card Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Card Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Starbucks, Tesco, Gym Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white placeholder-zinc-600"
            />
          </div>

          {/* Card Number & Scanner */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Card Number / Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Enter numbers or letters"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white font-mono tracking-wider placeholder-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 text-xs font-semibold shrink-0"
              >
                <Camera className="w-4 h-4" /> Scan
              </button>
            </div>
          </div>

          {/* Code Format */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Code Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white"
            >
              <option value="code128">Barcode (Code-128)</option>
              <option value="ean13">Barcode (EAN-13)</option>
              <option value="ean8">Barcode (EAN-8)</option>
              <option value="upca">Barcode (UPC-A)</option>
              <option value="code39">Barcode (Code-39)</option>
              <option value="qr">QR Code</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_PRESETS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 text-center rounded-xl text-xs font-semibold border transition-all ${
                    category === cat.id
                      ? 'bg-zinc-800 border-indigo-500 text-white font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Gradient Presets + Custom Color Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Card Color/Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setColor(preset.name)}
                  className={`h-11 rounded-xl bg-gradient-to-br ${preset.value} flex items-center justify-center transition-all ${
                    color === preset.name ? 'ring-2 ring-indigo-400 scale-95 border-none' : 'border border-white/5 opacity-80 hover:opacity-100'
                  }`}
                  title={preset.name}
                >
                  {color === preset.name && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
              
              {/* Custom Gradient Option Button */}
              <button
                type="button"
                onClick={() => setColor(`${customStart},${customEnd}`)}
                className={`h-11 rounded-xl flex items-center justify-center transition-all relative overflow-hidden ${
                  color.includes(',') ? 'ring-2 ring-indigo-400 scale-95 border-none' : 'border border-zinc-800 bg-zinc-900/60 opacity-80 hover:opacity-100'
                }`}
                style={{ background: `linear-gradient(135deg, ${customStart}, ${customEnd})` }}
              >
                {color.includes(',') ? (
                  <Check className="w-4 h-4 text-white drop-shadow" />
                ) : (
                  <span className="text-[10px] font-bold text-white uppercase drop-shadow">Custom</span>
                )}
              </button>
            </div>

            {/* Custom Color Pickers Panel */}
            {color.includes(',') && (
              <div className="flex gap-4 mt-2 p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl animate-in fade-in duration-200">
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Start Color</span>
                  <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                    <input
                      type="color"
                      value={customStart}
                      onChange={(e) => handleCustomColorChange(e.target.value, customEnd)}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] font-mono uppercase text-zinc-400">{customStart}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">End Color</span>
                  <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                    <input
                      type="color"
                      value={customEnd}
                      onChange={(e) => handleCustomColorChange(customStart, e.target.value)}
                      className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] font-mono uppercase text-zinc-400">{customEnd}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Notes (Optional)</label>
            <textarea
              placeholder="Add store details, account name or phone number..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white placeholder-zinc-600 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_20px_rgba(99,102,241,0.25)] transition-all active:scale-[0.99]"
          >
            Create Membership Card
          </button>

        </form>

        {/* Camera Scanner View */}
        {showScanner && (
          <Scanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScanner(false)}
          />
        )}

      </div>
    </div>
  );
}
