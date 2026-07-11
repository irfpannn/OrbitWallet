'use client';

import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  format: 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39';
  width?: number;
  height?: number;
  displayValue?: boolean;
}

export default function Barcode({
  value,
  format,
  width = 2,
  height = 80,
  displayValue = true
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        setError(null);
        JsBarcode(svgRef.current, value, {
          format: format === 'upca' ? 'UPC' : format.toUpperCase(),
          width,
          height,
          displayValue,
          background: '#ffffff',
          lineColor: '#000000',
          margin: 8,
        });
      } catch (err) {
        console.error('JsBarcode rendering error:', err);
        setError('Format mismatch with value');
      }
    }
  }, [value, format, width, height, displayValue]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm">
        <span className="font-semibold">Barcode Error</span>
        <span className="text-xs mt-1 text-center">Value "{value}" invalid for {format.toUpperCase()}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 rounded-lg flex justify-center w-full overflow-x-auto select-none">
      <svg ref={svgRef} className="max-w-full" />
    </div>
  );
}
