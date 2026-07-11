export interface MembershipCard {
  id: string;
  name: string;
  cardNumber: string;
  format: 'qr' | 'code128' | 'ean13' | 'ean8' | 'upca' | 'code39';
  color: string; // Tailwind gradient class key or custom CSS
  category: string;
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = 'orbit-wallet-cards';

export const COLOR_PRESETS = [
  { name: 'Sunset Glow', value: 'from-orange-500 to-rose-500 text-white' },
  { name: 'Ocean Depth', value: 'from-blue-600 to-indigo-800 text-white' },
  { name: 'Forest Emerald', value: 'from-emerald-500 to-teal-700 text-white' },
  { name: 'Cosmic Purple', value: 'from-purple-600 to-pink-600 text-white' },
  { name: 'Dark Obsidian', value: 'from-zinc-800 to-zinc-950 text-white border border-zinc-700' },
  { name: 'Golden Aura', value: 'from-amber-400 to-orange-600 text-white' },
];

export const CATEGORY_PRESETS = [
  { id: 'retail', label: 'Shopping & Retail' },
  { id: 'food', label: 'Food & Beverage' },
  { id: 'travel', label: 'Travel & Transport' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'other', label: 'Others' }
];

export const STORE_PRESETS = [
  { name: 'Tesco / Lotus\'s', color: 'from-blue-600 to-red-600 text-white', category: 'retail', format: 'code128' },
  { name: 'Starbucks', color: 'from-green-700 to-emerald-900 text-white', category: 'food', format: 'qr' },
  { name: 'Watsons', color: 'from-teal-500 to-cyan-600 text-white', category: 'retail', format: 'code128' },
  { name: 'IKEA', color: 'from-blue-700 to-yellow-500 text-white', category: 'retail', format: 'code128' },
  { name: 'Aeon', color: 'from-fuchsia-700 to-purple-800 text-white', category: 'retail', format: 'code128' },
  { name: 'Sephora', color: 'from-black to-zinc-800 text-white border border-zinc-700', category: 'retail', format: 'qr' }
];

export function getCards(): MembershipCard[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading localStorage', e);
    return [];
  }
}

export function saveCards(cards: MembershipCard[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Error writing localStorage', e);
  }
}

export function addCard(card: Omit<MembershipCard, 'id' | 'createdAt'>): MembershipCard {
  const cards = getCards();
  const newCard: MembershipCard = {
    ...card,
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    createdAt: new Date().toISOString()
  };
  cards.push(newCard);
  saveCards(cards);
  return newCard;
}

export function updateCard(id: string, updatedFields: Partial<Omit<MembershipCard, 'id' | 'createdAt'>>): void {
  const cards = getCards();
  const index = cards.findIndex(c => c.id === id);
  if (index !== -1) {
    cards[index] = { ...cards[index], ...updatedFields };
    saveCards(cards);
  }
}

export function deleteCard(id: string): void {
  const cards = getCards();
  const filtered = cards.filter(c => c.id !== id);
  saveCards(filtered);
}

export function getCardById(id: string): MembershipCard | undefined {
  const cards = getCards();
  return cards.find(c => c.id === id);
}
