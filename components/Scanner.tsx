'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string, format: 'qr' | 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39') => void;
  onClose: () => void;
}

export default function Scanner({ onScanSuccess, onClose }: ScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const elementId = 'scanner-video-region';

  useEffect(() => {
    let active = true;

    // Get cameras list
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!active) return;
        setCameras(devices);
        if (devices.length > 0) {
          // Find back camera if available
          const backCam = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('environment') ||
            device.label.toLowerCase().includes('rear')
          );
          const chosenId = backCam ? backCam.id : devices[0].id;
          setCurrentCameraId(chosenId);
          startScanner(chosenId);
        } else {
          setError('No camera found on your device.');
        }
      })
      .catch((err) => {
        console.error('Camera listing error:', err);
        setError('Camera permission denied or block list enabled.');
      });

    return () => {
      active = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(err => console.error('Cleanup stop error', err));
      }
    };
  }, []);

  const startScanner = async (cameraId: string) => {
    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }

      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        cameraId,
        {
          fps: 15,
          qrbox: (width, height) => {
            const size = Math.min(width, height);
            // Return barcode shape (wider and shorter)
            return {
              width: Math.floor(width * 0.85),
              height: Math.floor(height * 0.4)
            };
          },
        },
        (decodedText, decodedResult) => {
          let mappedFormat: 'qr' | 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39' = 'code128';
          const formatName = decodedResult?.result?.format?.formatName;

          if (formatName === 'QR_CODE') mappedFormat = 'qr';
          else if (formatName === 'EAN_13') mappedFormat = 'ean13';
          else if (formatName === 'EAN_8') mappedFormat = 'ean8';
          else if (formatName === 'UPC_A') mappedFormat = 'upca';
          else if (formatName === 'CODE_39') mappedFormat = 'code39';
          
          onScanSuccess(decodedText, mappedFormat);
          if (scannerRef.current) {
            scannerRef.current.stop().catch(err => console.error(err));
          }
        },
        () => {
          // Silent failure callback for un-scanned frames
        }
      );
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error('Start scanner error:', err);
      setError('Could not access camera feed. Check permissions.');
    }
  };

  const switchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextId = cameras[nextIndex].id;
    setCurrentCameraId(nextId);
    startScanner(nextId);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between z-50 p-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between max-w-md mt-4">
        <div className="flex items-center gap-2 text-white">
          <Camera className="w-5 h-5 text-indigo-400" />
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
      <div className="w-full max-w-md aspect-video relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 flex items-center justify-center my-auto">
        <div id={elementId} className="w-full h-full object-cover [&>video]:object-cover" />
        
        {/* Modern Scanning overlay target border */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
            <div className="w-[85%] h-[40%] border-2 border-dashed border-indigo-400 rounded-xl relative">
              {/* Laser animation */}
              <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_8px_#6366f1] animate-pulse top-1/2" />
            </div>
            <p className="text-white/60 text-xs mt-4 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
              Align barcode / QR code inside frame
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-zinc-900/90 flex flex-col items-center justify-center p-6 text-center text-white">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={() => currentCameraId && startScanner(currentCameraId)}
              className="mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="w-full flex justify-center max-w-md mb-8">
        {cameras.length > 1 && (
          <button
            onClick={switchCamera}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all font-medium text-sm border border-white/5 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Switch Camera ({cameras.length})
          </button>
        )}
      </div>
    </div>
  );
}
