'use client';

import React from 'react';
import { MembershipCard, COLOR_PRESETS } from '@/utils/storage';
import { ShoppingBag, Coffee, Plane, Film, CreditCard, QrCode as QrIcon } from 'lucide-react';

interface CardWidgetProps {
  card: MembershipCard;
  onClick?: () => void;
  showDetails?: boolean;
}

export default function CardWidget({ card, onClick, showDetails = false }: CardWidgetProps) {
  const isCustomColor = card.color.startsWith('#') || card.color.includes(',');
  let bgStyle: React.CSSProperties = {};
  let bgClassName = '';

  if (isCustomColor) {
    const colors = card.color.split(',');
    const start = colors[0];
    const end = colors[1] || colors[0];
    bgStyle = { background: `linear-gradient(135deg, ${start}, ${end})` };
    bgClassName = 'text-white';
  } else {
    const preset = COLOR_PRESETS.find(p => p.name === card.color) || COLOR_PRESETS[0];
    bgClassName = preset.value;
  }

  // Category Icon Selector
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'retail':
        return <ShoppingBag className="w-4 h-4" />;
      case 'food':
        return <Coffee className="w-4 h-4" />;
      case 'travel':
        return <Plane className="w-4 h-4" />;
      case 'entertainment':
        return <Film className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'retail': return 'Shopping';
      case 'food': return 'Food & Beverage';
      case 'travel': return 'Travel';
      case 'entertainment': return 'Entertainment';
      default: return 'Membership';
    }
  };

  // Format card number to groups of 4 digits for better readability
  const formatCardNumber = (num: string) => {
    return num.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div
      onClick={onClick}
      style={bgStyle}
      className={`relative w-full aspect-[1.586/1] rounded-2xl p-5 md:p-6 bg-gradient-to-br ${bgClassName} shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden select-none active:scale-[0.98] ${
        showDetails ? 'cursor-default pointer-events-none' : ''
      }`}
    >
      {/* Background decoration circles for depth */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-black/10 rounded-full blur-lg pointer-events-none" />

      {/* Glossy shine line */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-y-12 pointer-events-none" />

      <div className="h-full flex flex-col justify-between relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg md:text-xl tracking-tight leading-tight uppercase drop-shadow-sm">
              {card.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs opacity-80 font-medium">
              {getCategoryIcon(card.category)}
              <span>{getCategoryLabel(card.category)}</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 shadow-sm">
            <QrIcon className="w-5 h-5 opacity-90" />
          </div>
        </div>

        {/* Card Number display */}
        <div className="mt-auto">
          <p className="text-xs tracking-wider opacity-60 font-mono mb-1">CARD NUMBER</p>
          <div className="flex justify-between items-end">
            <p className="font-mono text-base md:text-lg tracking-widest font-semibold drop-shadow-sm">
              {formatCardNumber(card.cardNumber)}
            </p>
            <span className="text-[10px] py-0.5 px-2 rounded-md bg-black/20 text-white/90 border border-white/5 font-semibold uppercase tracking-wider">
              {card.format === 'qr' ? 'QR Code' : card.format.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
