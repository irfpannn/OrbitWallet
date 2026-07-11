'use client';

import React from 'react';
import QRCode from 'react-qr-code';

interface QrCodeProps {
  value: string;
  size?: number;
}

export default function QrCode({ value, size = 180 }: QrCodeProps) {
  return (
    <div className='bg-white p-3 rounded-2xl flex items-center justify-center shadow-inner select-none w-full max-w-[190px] mx-auto aspect-square'>
      <QRCode
        value={value}
        size={size}
        level='L' // Medium error correction level for standard density
        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
      />
    </div>
  );
}
