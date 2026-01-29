import { Tables } from './supabase';

// Base types from Supabase
type DbProduct = Tables<'products'>;
type DbProfile = Tables<'profiles'>;
type DbTransaction = Tables<'transactions'>;

// Extended and simplified types for application use

export type UserRole = 'user' | 'seller' | 'admin';

export type UserProfile = DbProfile & {
    role: UserRole;
};

// The Product type should include all fields from the database row,
// and extend it with the nested seller profile.
export type Product = DbProduct & {
    seller: Pick<UserProfile, 'username' | 'full_name' | 'avatar_url'> | null;
};


// Make sure all properties of DbTransaction are included, but allow overrides
export type Transaction = Omit<DbTransaction, 'user_id'> & {
    // Add any other custom fields for Transaction if needed in the future
};

export type Wallet = {
    balance: number;
    currency: CurrencyCode;
};

export type ServiceItem = {
    nameKey: string;
    icon: React.ComponentType<{ size: number; className?: string; }>;
};

export type Language = 'en' | 'id';

export type Currency = {
    code: CurrencyCode;
    symbol: string;
    name: string;
};

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'JPY' | 'SGD';
