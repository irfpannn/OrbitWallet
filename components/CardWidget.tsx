'use client';

import React from 'react';
import { MembershipCard, COLOR_PRESETS } from '@/utils/storage';
import { ShoppingBag, Coffee, Plane, Film, CreditCard, QrCode as QrIcon, Wallet } from 'lucide-react';

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

  // Size-dependent CSS configurations
  const paddingClass = showDetails ? 'p-5 md:p-6 rounded-2xl' : 'p-3.5 rounded-xl';
  const titleClass = showDetails ? 'text-base md:text-lg font-bold tracking-tight leading-tight uppercase drop-shadow-sm' : 'text-[10px] md:text-xs font-bold truncate tracking-tight uppercase max-w-[100px] block drop-shadow-sm';
  const categoryContainerClass = showDetails ? 'flex items-center gap-1.5 mt-1 text-xs opacity-80 font-medium' : 'flex items-center gap-1 mt-0.5 text-[8px] opacity-75 font-medium';
  const qrContainerClass = showDetails ? 'p-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 shadow-sm' : 'p-1 rounded-lg bg-white/15 border border-white/10';
  const qrIconClass = showDetails ? 'w-5 h-5 opacity-90' : 'w-3 h-3 opacity-90';
  const cardNumberLabelClass = showDetails ? 'text-[10px] tracking-wider opacity-60 font-mono mb-1' : 'text-[7px] tracking-wider opacity-50 font-mono mb-0.5';
  const cardNumberTextClass = showDetails ? 'font-mono text-sm md:text-base tracking-widest font-semibold drop-shadow-sm' : 'font-mono text-[9px] tracking-wider font-semibold drop-shadow-sm truncate max-w-[100px]';
  const badgeClass = showDetails ? 'text-[9px] py-0.5 px-2 rounded-md bg-black/20 text-white/90 border border-white/5 font-semibold uppercase tracking-wider' : 'text-[6px] py-0.25 px-1 rounded bg-black/25 text-white/80 font-bold uppercase tracking-wider';

  // Category Icon Selector
  const getCategoryIcon = (category: string) => {
    const sizeClass = showDetails ? 'w-4 h-4' : 'w-2.5 h-2.5';
    switch (category) {
      case 'retail':
        return <ShoppingBag className={sizeClass} />;
      case 'food':
        return <Coffee className={sizeClass} />;
      case 'travel':
        return <Plane className={sizeClass} />;
      case 'entertainment':
        return <Film className={sizeClass} />;
      case 'duitnow':
        return <Wallet className={sizeClass} />;
      default:
        return <CreditCard className={sizeClass} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'retail': return 'Shopping';
      case 'food': return 'Food & Beverage';
      case 'travel': return 'Travel';
      case 'entertainment': return 'Entertainment';
      case 'duitnow': return 'DuitNow QR';
      default: return 'Membership';
    }
  };

  // Format card number to groups of 4 digits for better readability
  const formatCardNumber = (num: string) => {
    if (card.category === 'duitnow') return num;
    return num.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div
      onClick={onClick}
      style={bgStyle}
      className={`relative w-full aspect-[1.586/1] bg-gradient-to-br ${bgClassName} shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 overflow-hidden select-none active:scale-[0.98] ${paddingClass} ${
        showDetails ? 'cursor-default pointer-events-none shadow-xl' : ''
      }`}
    >
      {/* Background decoration circles for depth */}
      <div className={`absolute bg-white/10 rounded-full blur-xl pointer-events-none ${showDetails ? '-right-10 -bottom-10 w-40 h-40' : '-right-8 -bottom-8 w-24 h-24'}`} />
      <div className={`absolute bg-black/10 rounded-full blur-lg pointer-events-none ${showDetails ? '-left-12 -top-12 w-32 h-32' : '-left-10 -top-10 w-20 h-20'}`} />

      {/* Glossy shine line */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-y-12 pointer-events-none" />

      <div className="h-full flex flex-col justify-between relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className={titleClass}>
              {card.name}
            </h3>
            <div className={categoryContainerClass}>
              {getCategoryIcon(card.category)}
              <span>{getCategoryLabel(card.category)}</span>
            </div>
          </div>
          <div className={qrContainerClass}>
            <QrIcon className={qrIconClass} />
          </div>
        </div>

        {/* Card Number display */}
        <div className="mt-auto">
          <p className={cardNumberLabelClass}>
            {card.category === 'duitnow' ? 'DUITNOW ID' : 'CARD NUMBER'}
          </p>
          <div className="flex justify-between items-end">
            <p className={cardNumberTextClass}>
              {formatCardNumber(card.category === 'duitnow' ? (card.accountNumber || card.cardNumber) : card.cardNumber)}
            </p>
            <span className={badgeClass}>
              {card.format === 'qr' ? 'QR Code' : card.format.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
