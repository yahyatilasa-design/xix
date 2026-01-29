import { supabase } from './supabaseClient';
import { AppConfig, PPOBConfig, PaymentConfig } from '../types';

// Default Configurations
const DEFAULT_PPOB_CONFIG: PPOBConfig = {
  provider: 'digiflazz',
  isActive: false,
  username: '',
  apiKey: '',
  merchantCode: '',
  privateKey: '',
  clientId: '',
  clientSecret: '',
  mode: 'sandbox'
};

const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  gateway: 'midtrans',
  isActive: false,
  serverKey: '',
  clientKey: '',
  merchantCode: '',
  apiKey: '',
  mode: 'sandbox'
};

export const getAppConfig = async (): Promise<AppConfig> => {
  try {
    const { data, error } = await supabase
      .from('app_configs')
      .select('*');

    if (error) throw error;

    const configMap: any = {};
    data?.forEach(item => {
      configMap[item.key] = item.value;
    });

    return {
      ppob: { ...DEFAULT_PPOB_CONFIG, ...configMap.ppob },
      payment: { ...DEFAULT_PAYMENT_CONFIG, ...configMap.payment }
    };
  } catch (error) {
    console.warn("Failed to fetch configs, using defaults:", error);
    return {
      ppob: DEFAULT_PPOB_CONFIG,
      payment: DEFAULT_PAYMENT_CONFIG
    };
  }
};

export const savePPOBConfig = async (config: PPOBConfig) => {
  const { error } = await supabase
    .from('app_configs')
    .upsert({ 
        key: 'ppob', 
        value: config, 
        updated_at: new Date().toISOString() 
    }, { onConflict: 'key' });

  if (error) throw error;
};

export const savePaymentConfig = async (config: PaymentConfig) => {
  const { error } = await supabase
    .from('app_configs')
    .upsert({ 
        key: 'payment', 
        value: config, 
        updated_at: new Date().toISOString() 
    }, { onConflict: 'key' });

  if (error) throw error;
};