'use client';

import React, { useState } from 'react';
import { Scanner as QrScanner, useDevices } from '@yudiel/react-qr-scanner';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string, format: 'qr' | 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39') => void;
  onClose: () => void;
}

export default function Scanner({ onScanSuccess, onClose }: ScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const devices = useDevices();

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes.length === 0) return;
    
    const code = detectedCodes[0];
    const decodedText = code.rawValue;
    const format = code.format;
    
    let mappedFormat: 'qr' | 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39' = 'code128';
    
    if (format === 'qr_code' || format === 'micro_qr_code') mappedFormat = 'qr';
    else if (format === 'code_128') mappedFormat = 'code128';
    else if (format === 'ean_13') mappedFormat = 'ean13';
    else if (format === 'ean_8') mappedFormat = 'ean8';
    else if (format === 'upc_a') mappedFormat = 'upca';
    else if (format === 'code_39') mappedFormat = 'code39';
    
    onScanSuccess(decodedText, mappedFormat);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between z-50 p-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between max-w-md mt-4">
        <div className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-lg">Scan Card</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
          aria-label="Close scanner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Scanner Window */}
      <div className="w-full max-w-md aspect-video relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-955 flex items-center justify-center my-auto">
        {error ? (
          <div className="absolute inset-0 bg-zinc-900/90 flex flex-col items-center justify-center p-6 text-center text-white z-10">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setFacingMode('environment');
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 rounded-xl text-xs font-semibold hover:bg-emerald-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <QrScanner
              onScan={handleScan}
              onError={(err) => {
                console.error('Scan error:', err);
                setError(err?.message || 'Could not access camera feed. Check permissions.');
              }}
              constraints={{ facingMode }}
              classNames={{
                container: 'w-full h-full object-cover',
                video: 'w-full h-full object-cover',
              }}
              sound={false}
              components={{
                finder: false,
              }}
            />
            {/* Modern Scanning overlay target border */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center z-10">
              <div className="w-[85%] h-[40%] border-2 border-dashed border-emerald-400 rounded-xl relative">
                {/* Laser animation */}
                <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse top-1/2" />
              </div>
              <p className="text-white/60 text-xs mt-4 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                Align barcode / QR code inside frame
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer Controls */}
      <div className="w-full flex justify-center max-w-md mb-8">
        <button
          onClick={switchCamera}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all font-medium text-sm border border-white/5 active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Switch Camera {devices.length > 1 ? `(${devices.length})` : ''}
        </button>
      </div>
    </div>
  );
}
