import { supabase } from './supabaseClient';
import { getAppConfig } from './adminService';

interface CreateInvoiceParams {
  amount: number;
  description: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

// --- MOCK LOGIC ---

const mockCreateInvoice = async (params: CreateInvoiceParams) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    invoiceId: `INV-${Date.now()}`,
    paymentUrl: '#', // In a real mock, this might be a local success page
    token: `MOCK-SNAP-TOKEN-${Date.now()}`,
    status: 'PENDING'
  };
};

// --- MAIN SERVICE ---

export const createInvoice = async (params: CreateInvoiceParams) => {
  try {
    const { payment } = await getAppConfig();

    // 1. Mock Mode
    if (!payment.isActive) {
      console.log("[Payment Mock] Creating invoice:", params);
      return await mockCreateInvoice(params);
    }

    // 2. Real Edge Function (Midtrans/Xendit)
    const { data, error } = await supabase.functions.invoke('create-payment', {
      body: { 
        amount: params.amount,
        description: params.description,
        userId: params.user.id,
        userEmail: params.user.email,
        userName: params.user.fullName,
        gateway: payment.gateway
      }
    });

    if (error) {
      console.error("Payment Function Error:", error);
      throw new Error("Failed to create payment invoice");
    }

    return data;

  } catch (err) {
    console.error("Payment Service Error:", err);
    throw err;
  }
};