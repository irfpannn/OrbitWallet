'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QrCodeProps {
  value: string;
  size?: number;
}

export default function QrCode({ value, size = 180 }: QrCodeProps) {
  return (
    <div className="bg-white p-3 rounded-2xl flex items-center justify-center shadow-inner select-none">
      <QRCodeSVG
        value={value}
        size={size}
        level="H" // High error correction level for reliable scanner detection
        includeMargin={true}
      />
    </div>
  );
}
