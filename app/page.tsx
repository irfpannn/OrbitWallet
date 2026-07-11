'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MembershipCard, getCards, CATEGORY_PRESETS, COLOR_PRESETS, updateCard, deleteCard } from '@/utils/storage';
import CardWidget from '@/components/CardWidget';
import Barcode from '@/components/Barcode';
import QrCode from '@/components/QrCode';
import { Plus, Search, Sparkles, SlidersHorizontal, Info, X, Edit, Trash2, Sun, Check, Camera, Image as GalleryIcon } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

// Dynamically import Scanner to prevent SSR loading issues
const Scanner = dynamic(() => import('@/components/Scanner'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-55 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Opening camera module...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [cards, setCards] = useState<MembershipCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modal & Edit state
  const [activeCard, setActiveCard] = useState<MembershipCard | null>(null);
  const [brightMode, setBrightMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form states (Editing inside modal)
  const [editName, setEditName] = useState('');
  const [editCardNumber, setEditCardNumber] = useState('');
  const [editFormat, setEditFormat] = useState<'qr' | 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39'>('code128');
  const [editColor, setEditColor] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [customStart, setCustomStart] = useState('#6366f1');
  const [customEnd, setCustomEnd] = useState('#a855f7');

  // Scanner states (for editing inside modal)
  const [showScanner, setShowScanner] = useState(false);
  const [isScanningGallery, setIsScanningGallery] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  useEffect(() => {
    setCards(getCards());
    setLoading(false);
  }, []);

  const openCardModal = (card: MembershipCard) => {
    setActiveCard(card);
    setBrightMode(false);
    setIsEditing(false);
    
    // Populate form states
    setEditName(card.name);
    setEditCardNumber(card.cardNumber);
    setEditFormat(card.format);
    setEditColor(card.color);
    setEditCategory(card.category);
    setEditNotes(card.notes || '');
    setEditAccountNumber(card.accountNumber || '');

    if (card.color.includes(',')) {
      const [start, end] = card.color.split(',');
      setCustomStart(start);
      setCustomEnd(end || start);
    }
  };

  const handleCustomColorChange = (start: string, end: string) => {
    setCustomStart(start);
    setCustomEnd(end);
    setEditColor(`${start},${end}`);
  };

  const handleScanSuccess = (decodedText: string, detectedFormat: 'qr' | 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39') => {
    setEditCardNumber(decodedText);
    setEditFormat(detectedFormat);
    setShowScanner(false);
  };

  const handleGalleryScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningGallery(true);
    setGalleryError(null);

    try {
      const html5QrCode = new Html5Qrcode('hidden-gallery-scanner-modal');
      const decodedText = await html5QrCode.scanFile(file, false);
      
      setEditCardNumber(decodedText);

      // Auto-detect code format
      if (/^[0-9]{13}$/.test(decodedText)) {
        setEditFormat('ean13');
      } else if (/^[0-9]{8}$/.test(decodedText)) {
        setEditFormat('ean8');
      } else if (/^[0-9]{12}$/.test(decodedText)) {
        setEditFormat('upca');
      } else if (decodedText.startsWith('http') || decodedText.length > 25) {
        setEditFormat('qr');
      } else {
        setEditFormat('code128');
      }

      setIsScanningGallery(false);
    } catch (err) {
      console.error('Gallery scanning error:', err);
      setGalleryError('No valid barcode or QR code found in this image.');
      setIsScanningGallery(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCard || !editName.trim() || !editCardNumber.trim()) return;

    const payload = {
      name: editName,
      cardNumber: editCardNumber,
      format: editFormat,
      color: editColor,
      category: editCategory,
      notes: editNotes.trim() || undefined,
      accountNumber: editCategory === 'duitnow' ? (editAccountNumber.trim() || undefined) : undefined,
    };

    updateCard(activeCard.id, payload);

    // Refresh dashboard list and active card
    const updatedCards = getCards();
    setCards(updatedCards);
    const updatedActive = updatedCards.find(c => c.id === activeCard.id);
    if (updatedActive) {
      setActiveCard(updatedActive);
    }
    setIsEditing(false);
  };

  const handleDeleteCard = () => {
    if (!activeCard) return;
    deleteCard(activeCard.id);
    setCards(getCards());
    setActiveCard(null);
    setShowDeleteConfirm(false);
  };

  // Filter cards by category & search query
  const filteredCards = cards.filter((card) => {
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.cardNumber.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-955 text-zinc-100 font-sans pb-24">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 pt-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">AdaMember</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Wallet Dashboard
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

        {/* Categories */}
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

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3.5 animate-pulse">
            <div className="w-full aspect-[1.586/1] bg-zinc-900/60 rounded-xl" />
            <div className="w-full aspect-[1.586/1] bg-zinc-900/60 rounded-xl" />
            <div className="w-full aspect-[1.586/1] bg-zinc-900/60 rounded-xl" />
            <div className="w-full aspect-[1.586/1] bg-zinc-900/60 rounded-xl" />
          </div>
        ) : filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5">
            {filteredCards.map((card) => (
              <div key={card.id} onClick={() => openCardModal(card)}>
                <CardWidget card={card} />
              </div>
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

        {/* Offline notice */}
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

      {/* SCANNING MODAL OVERLAY */}
      {activeCard && (
        <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          
          <div className={`w-full max-w-sm rounded-3xl border shadow-2xl transition-all duration-300 p-6 flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto no-scrollbar ${
            brightMode ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
          }`}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-base truncate max-w-[200px]">
                {isEditing ? `Edit ${activeCard.name}` : activeCard.name}
              </h2>
              
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={() => setBrightMode(!brightMode)}
                      className={`p-2 rounded-xl border transition-all duration-200 active:scale-90 ${
                        brightMode ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-zinc-950 border-zinc-800 text-amber-400 hover:text-amber-300'
                      }`}
                      title="Toggle screen brightness"
                    >
                      <Sun className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`p-2 rounded-xl border transition-colors active:scale-90 ${
                        brightMode ? 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-800' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Edit details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className={`p-2 rounded-xl border transition-colors active:scale-90 ${
                        brightMode ? 'bg-red-50 border-red-100 text-red-600 hover:text-red-700' : 'bg-zinc-950 border-zinc-800 text-red-400 hover:text-red-300'
                      }`}
                      title="Delete card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveCard(null)}
                  className={`p-2 rounded-full transition-colors ${
                    brightMode ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200' : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isEditing ? (
              /* EDIT SCREEN INSIDE MODAL */
              <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-left">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Card Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Card Number / Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editCardNumber}
                      onChange={(e) => setEditCardNumber(e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="px-2.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-1 transition-colors active:scale-95 text-[10px] font-semibold shrink-0"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <label
                      className="px-2.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center gap-1 transition-colors active:scale-95 text-[10px] font-semibold shrink-0 cursor-pointer border border-zinc-700"
                    >
                      <GalleryIcon className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryScan}
                        className="hidden"
                        disabled={isScanningGallery}
                      />
                    </label>
                  </div>
                  {isScanningGallery && (
                    <p className="text-[9px] text-indigo-400 mt-0.5 animate-pulse">Scanning image...</p>
                  )}
                  {galleryError && (
                    <p className="text-[9px] text-red-400 mt-0.5">{galleryError}</p>
                  )}
                </div>

                {/* DuitNow ID for display */}
                {editCategory === 'duitnow' && (
                  <div className="flex flex-col gap-1 animate-in fade-in duration-200">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">DuitNow ID (for display)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phone Number, Bank Account"
                      value={editAccountNumber}
                      onChange={(e) => setEditAccountNumber(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl text-xs font-mono"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Code Format</label>
                  <select
                    value={editFormat}
                    onChange={(e) => setEditFormat(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-zinc-950 text-white border border-zinc-800 rounded-xl text-xs"
                  >
                    <option value="code128">Barcode (Code-128)</option>
                    <option value="ean13">Barcode (EAN-13)</option>
                    <option value="ean8">Barcode (EAN-8)</option>
                    <option value="upca">Barcode (UPC-A)</option>
                    <option value="code39">Barcode (Code-39)</option>
                    <option value="qr">QR Code</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Category</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORY_PRESETS.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setEditCategory(cat.id);
                          if (cat.id === 'duitnow') setEditFormat('qr');
                        }}
                        className={`py-2 text-center rounded-lg text-[10px] font-semibold border transition-all ${
                          editCategory === cat.id
                            ? 'bg-zinc-800 border-indigo-500 text-white'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Theme</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setEditColor(preset.name)}
                        className={`h-8 rounded-lg bg-gradient-to-br ${preset.value} flex items-center justify-center transition-all ${
                          editColor === preset.name ? 'ring-2 ring-indigo-400 scale-95 border-none' : 'border border-white/5 opacity-80'
                        }`}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditColor(`${customStart},${customEnd}`)}
                      className={`h-8 rounded-lg flex items-center justify-center transition-all ${
                        editColor.includes(',') ? 'ring-2 ring-indigo-400 scale-95 border-none' : 'border border-zinc-800 bg-zinc-950 opacity-80'
                      }`}
                      style={{ background: `linear-gradient(135deg, ${customStart}, ${customEnd})` }}
                    >
                      {editColor.includes(',') ? <Check className="w-3.5 h-3.5 text-white" /> : <span className="text-[8px] text-white font-bold uppercase">Custom</span>}
                    </button>
                  </div>
                  {editColor.includes(',') && (
                    <div className="flex gap-2 mt-1.5 p-2 bg-zinc-950 border border-zinc-850 rounded-lg">
                      <div className="flex-1 flex flex-col gap-0.5">
                        <input
                          type="color"
                          value={customStart}
                          onChange={(e) => handleCustomColorChange(e.target.value, customEnd)}
                          className="w-full h-6 border-0 bg-transparent cursor-pointer rounded"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <input
                          type="color"
                          value={customEnd}
                          onChange={(e) => handleCustomColorChange(customStart, e.target.value)}
                          className="w-full h-6 border-0 bg-transparent cursor-pointer rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Notes (Optional)</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={1.5}
                    className="w-full px-3 py-2 bg-zinc-950 text-white border border-zinc-800 rounded-xl text-xs resize-none"
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10"
                  >
                    Save
                  </button>
                </div>

              </form>
            ) : (
              /* VIEW CODE SCREEN INSIDE MODAL */
              <div className="flex flex-col items-center gap-6 animate-in fade-in duration-200">
                
                {/* Visual Card Display */}
                <div className="w-full">
                  <CardWidget card={activeCard} showDetails={true} />
                </div>

                {/* Generated Scan Code */}
                <div className={`w-full p-4 rounded-2xl border shadow-inner flex flex-col items-center gap-3 ${
                  brightMode ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800/80'
                }`}>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-450">
                    Present Code to Cashier
                  </span>
                  
                  <div className="w-full flex items-center justify-center p-1.5 select-none bg-white rounded-xl">
                    {activeCard.format === 'qr' ? (
                      <QrCode value={activeCard.cardNumber} size={150} />
                    ) : (
                      <Barcode value={activeCard.cardNumber} format={activeCard.format} height={70} />
                    )}
                  </div>

                  <div className="text-center mt-1">
                    <p className="font-mono text-base font-bold tracking-widest select-all">
                      {activeCard.category === 'duitnow' ? (activeCard.accountNumber || activeCard.cardNumber) : activeCard.cardNumber}
                    </p>
                    <p className="text-[9px] uppercase text-zinc-500 mt-0.5">
                      {activeCard.category === 'duitnow' ? 'DuitNow ID' : `Format: ${activeCard.format.toUpperCase()}`}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {activeCard.notes && (
                  <div className={`w-full p-3 rounded-xl border text-left ${
                    brightMode ? 'bg-zinc-50 border-zinc-150 text-zinc-700' : 'bg-zinc-950/20 border-zinc-850 text-zinc-400'
                  }`}>
                    <h4 className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Notes</h4>
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{activeCard.notes}</p>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Delete Confirm Modal inside Portal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="bg-zinc-900 border border-zinc-850 rounded-3xl p-6 w-full max-w-xs text-center text-white shadow-2xl">
                <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h3 className="text-base font-bold mb-1">Delete card?</h3>
                <p className="text-xs text-zinc-500 leading-normal mb-5">
                  Delete <span className="font-semibold text-zinc-300">"{activeCard.name}"</span> permanently?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCard}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Camera Scanner View for edit screen */}
          {showScanner && (
            <Scanner
              onScanSuccess={handleScanSuccess}
              onClose={() => setShowScanner(false)}
            />
          )}

          {/* Hidden element for Gallery scan */}
          <div id="hidden-gallery-scanner-modal" className="hidden" style={{ display: 'none' }} />

        </div>
      )}

    </div>
  );
}
