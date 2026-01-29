
export type UserRole = 'user' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  username: string | null;
  email: string;
  avatar_url?: string;
  full_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  role: UserRole;
  updated_at?: string;
}

export interface Wallet {
  balance: number;
  currency: string;
}

// Strict Product Interface matching DB
export interface Product {
  id: string;
  seller_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  file_url: string | null;
  category: string;
  rating: number;
  created_at: string;
  // Joined fields (optional, depending on query)
  seller?: Pick<UserProfile, 'username' | 'full_name' | 'avatar_url'>;
}

// Helper type for inserting (omitting auto-generated fields)
export interface ProductInsert {
  seller_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string | null;
  file_url: string | null;
  category?: string;
}

export interface ServiceItem {
  id: string;
  nameKey: string; // Translation key
  icon: string;
  route: string;
}

export interface Transaction {
  id: string;
  type: 'topup' | 'purchase' | 'transfer';
  amount: number;
  status: 'success' | 'pending' | 'failed';
  date: string;
  description: string;
}

export type Language = 'id' | 'en';

export type CurrencyCode = 'IDR' | 'USD' | 'SGD' | 'MYR' | 'THB' | 'PHP' | 'VND' | 'BND' | 'KHR' | 'LAK' | 'MMK';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// --- CONFIG TYPES ---

export type PPOBProvider = 'digiflazz' | 'ayoconnect' | 'tripay';
export type PaymentGateway = 'midtrans' | 'duitku' | 'xendit' | 'tripay';

export interface PPOBConfig {
  provider: PPOBProvider;
  isActive: boolean;
  username?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  merchantCode?: string;
  privateKey?: string;
  mode: 'sandbox' | 'production';
}

export interface PaymentConfig {
  gateway: PaymentGateway;
  isActive: boolean;
  merchantCode?: string;
  apiKey?: string;
  serverKey?: string;
  clientKey?: string;
  mode: 'sandbox' | 'production';
}

export interface AppConfig {
  ppob: PPOBConfig;
  payment: PaymentConfig;
}
