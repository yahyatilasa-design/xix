import { supabase } from './supabaseClient';
import { Wallet, Transaction, UserProfile } from '../types';
import { MOCK_TRANSACTIONS } from '../constants';

export const getUserWallet = async (userId: string): Promise<Wallet> => {
  try {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance, currency')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Fallback if table doesn't exist or user has no wallet record
      console.warn("Using mock wallet data. If you haven't set up the DB, run the commands in 'supabase_schema.sql' in your Supabase SQL Editor.");
      return { balance: 1250000, currency: 'IDR' };
    }

    return {
      balance: data.balance,
      currency: data.currency || 'IDR'
    };
  } catch (err) {
    console.error("Error fetching wallet:", err);
    return { balance: 1250000, currency: 'IDR' };
  }
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    // Defensive check: ensure data exists and is an array before checking length
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      // Fallback if table doesn't exist or user has no transactions
      console.warn("Using mock transactions data or empty result.");
      return [...MOCK_TRANSACTIONS]; 
    }

    // Map Supabase response to Transaction interface
    return data.map((tx: any) => ({
      id: tx.id,
      type: tx.type, 
      amount: tx.amount,
      status: tx.status,
      date: tx.date,
      description: tx.description
    }));
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return [...MOCK_TRANSACTIONS];
  }
};

export const getUserProfile = async (userId: string): Promise<Partial<UserProfile>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      // If the row doesn't exist (maybe trigger failed), return empty. 
      // The App.tsx will fallback to metadata.
      return {};
    }

    return {
      full_name: data.full_name,
      username: data.username,
      phone_number: data.phone_number,
      date_of_birth: data.date_of_birth,
      avatar_url: data.avatar_url,
      role: data.role as any // 'user' | 'admin' | 'seller'
    };
  } catch (err) {
    console.error("Error fetching profile:", err);
    return {};
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  // We try to update first.
  const { error, count } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select(); // Select to see if rows matched
    
  if (error) {
     console.error("Update failed", error);
     throw error;
  }
};