'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getCardById, updateCard, deleteCard, MembershipCard, COLOR_PRESETS, CATEGORY_PRESETS } from '@/utils/storage';
import CardWidget from '@/components/CardWidget';
import Barcode from '@/components/Barcode';
import QrCode from '@/components/QrCode';
import { ArrowLeft, Trash2, Edit, Sun, Check, X, AlertTriangle, Camera, Image as GalleryIcon } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

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

export default function CardDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [card, setCard] = useState<MembershipCard | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCardNumber, setEditCardNumber] = useState('');
  const [editFormat, setEditFormat] = useState<'qr' | 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39'>('code128');
  const [editColor, setEditColor] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');

  // Custom colors for theme picker
  const [customStart, setCustomStart] = useState('#6366f1');
  const [customEnd, setCustomEnd] = useState('#a855f7');

  // UI modes
  const [brightMode, setBrightMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanningGallery, setIsScanningGallery] = useState(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  useEffect(() => {
    const found = getCardById(id);
    if (found) {
      setCard(found);
      // Populate edit states
      setEditName(found.name);
      setEditCardNumber(found.cardNumber);
      setEditFormat(found.format);
      setEditColor(found.color);
      setEditCategory(found.category);
      setEditNotes(found.notes || '');
      setEditAccountNumber(found.accountNumber || '');
      
      // Parse custom colors if present
      if (found.color.includes(',')) {
        const [start, end] = found.color.split(',');
        setCustomStart(start);
        setCustomEnd(end || start);
      }
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center text-zinc-100">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Card Not Found</h2>
        <p className="text-zinc-500 text-sm mb-6">This membership card may have been removed.</p>
        <Link href="/" className="px-6 py-3 bg-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-500">
          Return to Dashboard
        </Link>
      </div>
    );
  }

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
      const html5QrCode = new Html5Qrcode('hidden-gallery-scanner-edit');
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editCardNumber.trim()) return;

    updateCard(id, {
      name: editName,
      cardNumber: editCardNumber,
      format: editFormat,
      color: editColor,
      category: editCategory,
      notes: editNotes.trim() || undefined,
      accountNumber: editCategory === 'duitnow' ? (editAccountNumber.trim() || undefined) : undefined,
    });

    // Refresh view
    const updated = getCardById(id);
    if (updated) setCard(updated);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteCard(id);
    router.push('/');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-16 ${brightMode ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-zinc-100'}`}>
      
      {/* Background radial highlight - hide in bright mode */}
      {!brightMode && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none" />
      )}

      <div className="max-w-md mx-auto px-4 pt-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Link
            href="/"
            className={`p-2.5 rounded-xl border transition-colors active:scale-95 ${
              brightMode ? 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex gap-2">
            <button
              onClick={() => setBrightMode(!brightMode)}
              className={`p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 ${
                brightMode 
                  ? 'bg-amber-100 border-amber-200 text-amber-700' 
                  : 'bg-zinc-900 border-zinc-800 text-amber-400 hover:text-amber-300'
              }`}
              title="Toggle scanner bright mode"
            >
              {brightMode ? <Sun className="w-5 h-5 fill-current animate-spin" style={{ animationDuration: '6s' }} /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2.5 rounded-xl border transition-colors active:scale-95 ${
                brightMode ? 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-800' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Edit Card"
            >
              {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`p-2.5 rounded-xl border transition-colors active:scale-95 ${
                brightMode ? 'bg-red-50 border-red-200 text-red-600 hover:text-red-700' : 'bg-zinc-900 border-zinc-800 text-red-400 hover:text-red-300'
              }`}
              title="Delete Card"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {isEditing ? (
          /* EDIT CARD FORM */
          <form onSubmit={handleSave} className="flex flex-col gap-5 animate-in fade-in duration-200">
            <h2 className="text-lg font-bold">Edit Details</h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-zinc-500">Card Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 text-white border border-zinc-800 rounded-xl text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-zinc-500">Card Number / Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={editCardNumber}
                  onChange={(e) => setEditCardNumber(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 bg-zinc-900 text-white border border-zinc-800 rounded-xl text-sm font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="px-3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 text-xs font-semibold shrink-0"
                >
                  <Camera className="w-4 h-4" /> Camera
                </button>
                <label
                  className="px-3 py-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95 text-xs font-semibold shrink-0 cursor-pointer border border-zinc-800"
                >
                  <GalleryIcon className="w-4 h-4" /> Gallery
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
                <p className="text-[10px] text-indigo-400 mt-1 animate-pulse">Scanning image file...</p>
              )}
              {galleryError && (
                <p className="text-[10px] text-red-400 mt-1">{galleryError}</p>
              )}
            </div>

            {/* DuitNow Account Display Info */}
            {editCategory === 'duitnow' && (
              <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-semibold uppercase text-zinc-550">DuitNow ID (for display)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile number, NRIC, or Account No."
                  value={editAccountNumber}
                  onChange={(e) => setEditAccountNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 text-white border border-zinc-800 rounded-xl text-sm font-mono"
                />
                <p className="text-[10px] text-zinc-500 leading-normal">
                  This ID displays on the card instead of the long DuitNow QR data string.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-zinc-500">Code Format</label>
              <select
                value={editFormat}
                onChange={(e) => setEditFormat(e.target.value as any)}
                className="w-full px-4 py-3 bg-zinc-900 text-white border border-zinc-800 rounded-xl text-sm"
              >
                <option value="code128">Barcode (Code-128)</option>
                <option value="ean13">Barcode (EAN-13)</option>
                <option value="ean8">Barcode (EAN-8)</option>
                <option value="upca">Barcode (UPC-A)</option>
                <option value="code39">Barcode (Code-39)</option>
                <option value="qr">QR Code</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-zinc-500">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_PRESETS.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setEditCategory(cat.id);
                      if (cat.id === 'duitnow') setEditFormat('qr');
                    }}
                    className={`p-3 text-center rounded-xl text-xs font-semibold border transition-all ${
                      editCategory === cat.id
                        ? 'bg-zinc-800 border-indigo-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-zinc-500">Card Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setEditColor(preset.name)}
                    className={`h-11 rounded-xl bg-gradient-to-br ${preset.value} flex items-center justify-center transition-all ${
                      editColor === preset.name ? 'ring-2 ring-indigo-400 scale-95 border-none' : 'border border-white/5 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {editColor === preset.name && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
                
                {/* Custom Gradient Option */}
                <button
                  type="button"
                  onClick={() => setEditColor(`${customStart},${customEnd}`)}
                  className={`h-11 rounded-xl flex items-center justify-center transition-all relative overflow-hidden ${
                    editColor.includes(',') ? 'ring-2 ring-indigo-400 scale-95 border-none' : 'border border-zinc-800 bg-zinc-900/60 opacity-80 hover:opacity-100'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${customStart}, ${customEnd})` }}
                >
                  {editColor.includes(',') ? (
                    <Check className="w-4 h-4 text-white drop-shadow" />
                  ) : (
                    <span className="text-[10px] font-bold text-white uppercase drop-shadow">Custom</span>
                  )}
                </button>
              </div>

              {/* Custom Input controls */}
              {editColor.includes(',') && (
                <div className="flex gap-4 mt-2 p-3 bg-zinc-900 border border-zinc-800 rounded-xl animate-in fade-in duration-200">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">Start Color</span>
                    <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                      <input
                        type="color"
                        value={customStart}
                        onChange={(e) => handleCustomColorChange(e.target.value, customEnd)}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer shrink-0"
                      />
                      <span className="text-[9px] font-mono uppercase text-zinc-400">{customStart}</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">End Color</span>
                    <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                      <input
                        type="color"
                        value={customEnd}
                        onChange={(e) => handleCustomColorChange(customStart, e.target.value)}
                        className="w-7 h-7 rounded border-0 bg-transparent cursor-pointer shrink-0"
                      />
                      <span className="text-[9px] font-mono uppercase text-zinc-400">{customEnd}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase text-zinc-500">Notes (Optional)</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-zinc-900 text-white border border-zinc-800 rounded-xl text-sm resize-none"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl text-sm font-semibold active:scale-[0.99]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold active:scale-[0.99] shadow-[0_4px_12px_rgba(99,102,241,0.2)]"
              >
                Save Changes
              </button>
            </div>

          </form>
        ) : (
          /* DISPLAY CARD & CODE */
          <div className="flex flex-col items-center gap-8 animate-in fade-in duration-200">
            
            {/* Visual Card CardWidget */}
            <div className="w-full">
              <CardWidget card={card} showDetails={true} />
            </div>

            {/* Brightness / Scan helper tip */}
            <div className={`w-full p-4 rounded-2xl border flex flex-col gap-2 ${
              brightMode 
                ? 'bg-amber-50 border-amber-100 text-amber-800' 
                : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider">Checkout Scanning</span>
                <button 
                  onClick={() => setBrightMode(!brightMode)}
                  className={`text-[10px] font-bold px-2 py-1 rounded ${
                    brightMode ? 'bg-amber-200 text-amber-900' : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {brightMode ? 'Active' : 'Enable Bright Screen'}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Physical scan guns read screens better with high brightness. Boost your screen brightness or toggle bright mode above for optimal scanning.
              </p>
            </div>

            {/* Generated Code Window */}
            <div className={`w-full p-6 rounded-3xl border shadow-lg flex flex-col items-center gap-4 ${
              brightMode ? 'bg-white border-zinc-200 shadow-zinc-200/50' : 'bg-zinc-900/40 border-zinc-800/60 shadow-black/40'
            }`}>
              <div className="w-full text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Present Code to Cashier
                </span>
              </div>

              {/* Dynamic Code generation */}
              <div className="w-full flex items-center justify-center p-2">
                {card.format === 'qr' ? (
                  <QrCode value={card.cardNumber} />
                ) : (
                  <Barcode value={card.cardNumber} format={card.format} />
                )}
              </div>

              <div className="text-center">
                <p className="font-mono text-lg font-bold tracking-widest select-all">
                  {card.category === 'duitnow' ? (card.accountNumber || card.cardNumber) : card.cardNumber}
                </p>
                <p className="text-[10px] uppercase text-zinc-500 mt-1">
                  {card.category === 'duitnow' ? 'DuitNow ID' : `Format: ${card.format === 'qr' ? 'QR Code' : card.format.toUpperCase()}`}
                </p>
              </div>
            </div>

            {/* Notes Section */}
            {card.notes && (
              <div className="w-full p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-1">Notes</h4>
                <p className="text-xs text-zinc-300 whitespace-pre-wrap">{card.notes}</p>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Delete card?</h3>
            <p className="text-xs text-zinc-500 leading-relaxed mb-6">
              This will permanently delete <span className="font-semibold text-zinc-300">"{card.name}"</span>. This action is irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Scanner View */}
      {showScanner && (
        <Scanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Hidden Container for Gallery scanning */}
      <div id="hidden-gallery-scanner-edit" className="hidden" style={{ display: 'none' }} />

    </div>
  );
}
