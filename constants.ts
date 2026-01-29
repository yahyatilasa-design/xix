import { ServiceItem } from './types';

export const TRANSLATIONS = {
  en: {
    welcome: "Welcome back,",
    balance: "Total Balance",
    add_funds: "Add Funds",
    send_money: "Send Money",
    top_sellers: "Top Sellers",
    recent_transactions: "Recent Transactions",
    ask_ai: "Ask XIX AI...",
    ai_greeting: "Hello! I'm XIX AI. I can help you with transactions, product info, or checking your balance.",
    services: {
      data: "Mobile Data",
      pln: "PLN / Power",
      games: "Game Topup",
      ewallet: "E-Wallet",
      insurance: "Insurance",
      internet: "Internet",
      bills: "Bills",
      more: "More",
    }
  },
  id: {
    welcome: "Selamat kembali,",
    balance: "Saldo Total",
    add_funds: "Isi Saldo",
    send_money: "Kirim Uang",
    top_sellers: "Penjual Terlaris",
    recent_transactions: "Transaksi Terkini",
    ask_ai: "Tanya XIX AI...",
    ai_greeting: "Halo! Saya XIX AI. Saya bisa bantu cek transaksi, info produk, atau saldo Anda.",
    services: {
      data: "Paket Data",
      pln: "Token PLN",
      games: "Topup Game",
      ewallet: "E-Wallet",
      insurance: "Asuransi",
      internet: "Internet",
      bills: "Tagihan",
      more: "Lainnya",
    }
  }
};

export const SERVICES: ServiceItem[] = [
  { id: '1', nameKey: 'data', icon: 'Signal', route: '/data' },
  { id: '2', nameKey: 'pln', icon: 'Zap', route: '/pln' },
  { id: '3', nameKey: 'games', icon: 'Gamepad2', route: '/games' },
  { id: '4', nameKey: 'ewallet', icon: 'Wallet', route: '/ewallet' },
  { id: '5', nameKey: 'insurance', icon: 'ShieldCheck', route: '/insurance' },
  { id: '6', nameKey: 'internet', icon: 'Wifi', route: '/internet' },
  { id: '7', nameKey: 'bills', icon: 'Receipt', route: '/bills' },
  { id: '8', nameKey: 'more', icon: 'Grid', route: '/more' },
];

export const MOCK_PRODUCTS = [
  { id: '1', name: 'Spotify Premium 1M', seller: 'DigitalMart', price: 25000, rating: 4.9, image_url: 'https://picsum.photos/200/200?random=1', category: 'digital' },
  { id: '2', name: 'Netflix UHD 1M', seller: 'StreamKing', price: 35000, rating: 4.8, image_url: 'https://picsum.photos/200/200?random=2', category: 'digital' },
  { id: '3', name: 'Canva Pro Lifetime', seller: 'DesignHub', price: 15000, rating: 4.7, image_url: 'https://picsum.photos/200/200?random=3', category: 'digital' },
  { id: '4', name: 'Windows 11 Pro Key', seller: 'SoftStore', price: 120000, rating: 4.9, image_url: 'https://picsum.photos/200/200?random=4', category: 'digital' },
] as const;

export const MOCK_TRANSACTIONS = [
  { id: 't1', type: 'purchase', amount: 25000, status: 'success', date: '2023-10-25', description: 'Spotify Premium' },
  { id: 't2', type: 'topup', amount: 500000, status: 'success', date: '2023-10-24', description: 'BCA Virtual Account' },
  { id: 't3', type: 'purchase', amount: 65000, status: 'success', date: '2023-10-22', description: 'Token PLN 50k' },
] as const;
