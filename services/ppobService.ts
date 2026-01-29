import { supabase } from './supabaseClient';
import { getAppConfig } from './adminService';

// This service handles the logic for PPOB (Data, PLN, etc).
// It switches between Local Mock (Simulation) and Real Edge Function (Production/Secure Sandbox)
// based on the configuration in the Admin Dashboard.

interface PPOBRequest {
  sku: string;
  customerNo: string;
  refId: string;
}

// --- MOCK LOGIC (Client-Side Simulation) ---

const mockCheckPrice = async (sku: string) => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
  return {
    sku,
    price: 50000,
    status: 'active',
    product_name: 'Pulsa 50k (Simulation)',
    rc: '00',
    sn: 'MOCK_SN_' + Date.now()
  };
};

const mockTransaction = async (req: PPOBRequest) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency
  console.log(`[PPOB Mock] Processing ${req.sku} for ${req.customerNo}`);
  return {
    status: 'success',
    refId: req.refId,
    customerNo: req.customerNo,
    sku: req.sku,
    message: 'Transaction processed successfully (Simulation)',
    sn: 'MOCK_SN_' + Date.now(),
    rc: '00'
  };
};

// --- MAIN SERVICE FUNCTIONS ---

export const checkPrice = async (sku: string) => {
  try {
    const { ppob } = await getAppConfig();

    // 1. If Integration is NOT active, use Mock
    if (!ppob.isActive) {
      return await mockCheckPrice(sku);
    }

    // 2. If Active, call Supabase Edge Function (Secure Server-Side)
    const { data, error } = await supabase.functions.invoke('ppob-transaction', {
      body: { action: 'check_price', sku, provider: ppob.provider }
    });

    if (error) {
      console.error("Edge Function Error:", error);
      throw new Error(error.message || "Failed to check price");
    }

    return data;
  } catch (err) {
    console.error("Check Price Failed:", err);
    throw err;
  }
};

export const createTransaction = async (req: PPOBRequest) => {
  try {
    const { ppob } = await getAppConfig();

    // 1. If Integration is NOT active, use Mock
    if (!ppob.isActive) {
      return await mockTransaction(req);
    }

    // 2. If Active, call Supabase Edge Function (Secure Server-Side)
    const { data, error } = await supabase.functions.invoke('ppob-transaction', {
      body: { 
        action: 'transaction', 
        sku: req.sku, 
        customerNo: req.customerNo, 
        refId: req.refId,
        provider: ppob.provider
      }
    });

    if (error) {
      console.error("Edge Function Error:", error);
      throw new Error(error.message || "Transaction failed");
    }

    return data;
  } catch (err) {
    console.error("Transaction Failed:", err);
    throw err;
  }
};