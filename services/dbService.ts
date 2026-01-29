'use client';

import { supabase } from './supabaseClient';
import { UserProfile, Wallet, Transaction } from '../types';

// --- DATABASE SERVICE FUNCTIONS ---

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching profile or profile not found:', error);
    return { id: userId, full_name: 'Guest User' } as UserProfile;
  }
  return data as UserProfile;
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }

    if (!data) {
        return [];
    }

    return data.map((tx: any) => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      status: tx.status,
      created_at: tx.created_at,
      description: tx.description
    }));
  } catch (err) {
    console.error("Fatal exception in getUserTransactions:", err);
    return [];
  }
};

export const getUserWallet = async (userId: string): Promise<Wallet> => {
    const { data, error } = await supabase
        .from('wallets')
        .select('balance, currency')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        console.error('Error fetching wallet:', error);
        return { balance: null, currency: null };
    }

    return data as Wallet;
};

/**
 * ADDED: The missing function to update a user's profile information.
 * This resolves the import error in the UserProfile component.
 */
export const updateUserProfile = async (userId: string, updates: { full_name?: string; phone_number?: string; avatar_url?: string; }) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    throw new Error(error.message);
  }
};
