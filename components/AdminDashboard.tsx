import React, { useState, useEffect } from 'react';
import { Save, Server, CreditCard, Shield, AlertTriangle, CheckCircle2, Loader2, Eye, EyeOff, Terminal, Activity, Key, Lock } from 'lucide-react';
import { getAppConfig, savePPOBConfig, savePaymentConfig } from '../services/adminService';
import { PPOBConfig, PaymentConfig } from '../types';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ppob' | 'payment'>('ppob');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [ppobConfig, setPpobConfig] = useState<PPOBConfig>({
    provider: 'digiflazz',
    isActive: false,
    username: '',
    apiKey: '',
    mode: 'sandbox'
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    gateway: 'midtrans',
    isActive: false,
    serverKey: '',
    clientKey: '',
    merchantCode: '',
    mode: 'sandbox'
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const config = await getAppConfig();
      if (config.ppob) setPpobConfig(config.ppob);
      if (config.payment) setPaymentConfig(config.payment);
    } catch (err) {
      console.error("Failed to load configs", err);
      setMessage({ type: 'error', text: 'Failed to load configurations' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePPOB = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await savePPOBConfig(ppobConfig);
      setMessage({ type: 'success', text: 'PPOB Configuration saved successfully' });
    } catch (err) {
       setMessage({ type: 'error', text: 'Failed to save PPOB settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await savePaymentConfig(paymentConfig);
      setMessage({ type: 'success', text: 'Payment Gateway Configuration saved successfully' });
    } catch (err) {
       setMessage({ type: 'error', text: 'Failed to save Payment settings' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading && !ppobConfig.provider) { // Initial load
      return (
          <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
      );
  }

  return (
    <div className="px-4 py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-purple-500" />
            Admin Configuration
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Manage external service integrations and API keys.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800">
          <button 
            onClick={() => { setActiveTab('ppob'); setMessage(null); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ppob' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            <Server size={16} /> PPOB Provider
          </button>
          <button 
            onClick={() => { setActiveTab('payment'); setMessage(null); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'payment' ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            <CreditCard size={16} /> Payment Gateway
          </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* PPOB Content */}
      {activeTab === 'ppob' && (
          <div className="space-y-6">
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Provider Settings</h3>
                        <p className="text-xs text-zinc-500">Configure connection to digital product aggregator.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                         <button 
                            onClick={() => setPpobConfig({...ppobConfig, mode: 'sandbox'})}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${ppobConfig.mode === 'sandbox' ? 'bg-yellow-500/20 text-yellow-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                         >
                            Sandbox
                         </button>
                         <button 
                            onClick={() => setPpobConfig({...ppobConfig, mode: 'production'})}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${ppobConfig.mode === 'production' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                         >
                            Production
                         </button>
                    </div>
                </div>

                <div className="grid gap-5">
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${ppobConfig.isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${ppobConfig.isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={ppobConfig.isActive} 
                                onChange={(e) => setPpobConfig({...ppobConfig, isActive: e.target.checked})} 
                            />
                            <span className="text-sm font-medium text-white">Enable Integration</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Provider</label>
                        <select 
                            value={ppobConfig.provider}
                            onChange={(e) => setPpobConfig({...ppobConfig, provider: e.target.value as any})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        >
                            <option value="digiflazz">Digiflazz</option>
                            <option value="ayoconnect">Ayoconnect</option>
                            <option value="tripay">TriPay (PPOB)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Username / Client ID</label>
                        <input 
                            type="text"
                            value={ppobConfig.username || ''}
                            onChange={(e) => setPpobConfig({...ppobConfig, username: e.target.value})}
                            placeholder="e.g. user123456"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400 flex justify-between">
                            <span>API Key / Secret</span>
                            <button onClick={() => toggleSecret('ppobKey')} className="text-emerald-500 text-[10px] hover:underline">
                                {showSecrets['ppobKey'] ? 'Hide' : 'Show'}
                            </button>
                        </label>
                        <div className="relative">
                            <input 
                                type={showSecrets['ppobKey'] ? "text" : "password"}
                                value={ppobConfig.apiKey || ''}
                                onChange={(e) => setPpobConfig({...ppobConfig, apiKey: e.target.value})}
                                placeholder="Your Secret Key"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                            />
                            <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        </div>
                    </div>
                    
                    {/* Additional fields for Digiflazz specifically often need webhook secret */}
                    <div className="p-4 bg-zinc-950/50 rounded-lg border border-dashed border-zinc-800">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <Terminal size={14} />
                            <span className="text-xs font-mono">Webhook URL</span>
                        </div>
                        <code className="text-xs text-zinc-500 block break-all">
                            https://tkztavbgtqfusfghoxay.supabase.co/functions/v1/ppob-callback
                        </code>
                    </div>
                </div>
             </div>

             <div className="flex justify-end">
                <button 
                    onClick={handleSavePPOB}
                    disabled={loading}
                    className="bg-emerald-550 hover:bg-emerald-600 active:scale-95 transition-all text-zinc-950 font-bold py-3 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save PPOB Settings
                </button>
             </div>
          </div>
      )}

      {/* Payment Content */}
      {activeTab === 'payment' && (
          <div className="space-y-6">
             <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Payment Gateway</h3>
                        <p className="text-xs text-zinc-500">Configure deposit methods and transaction fees.</p>
                    </div>
                     <div className="flex items-center gap-2 bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                         <button 
                            onClick={() => setPaymentConfig({...paymentConfig, mode: 'sandbox'})}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${paymentConfig.mode === 'sandbox' ? 'bg-yellow-500/20 text-yellow-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                         >
                            Sandbox
                         </button>
                         <button 
                            onClick={() => setPaymentConfig({...paymentConfig, mode: 'production'})}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${paymentConfig.mode === 'production' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                         >
                            Production
                         </button>
                    </div>
                </div>

                <div className="grid gap-5">
                     <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${paymentConfig.isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${paymentConfig.isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={paymentConfig.isActive} 
                                onChange={(e) => setPaymentConfig({...paymentConfig, isActive: e.target.checked})} 
                            />
                            <span className="text-sm font-medium text-white">Enable Gateway</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Gateway</label>
                        <select 
                            value={paymentConfig.gateway}
                            onChange={(e) => setPaymentConfig({...paymentConfig, gateway: e.target.value as any})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        >
                            <option value="midtrans">Midtrans (Snap)</option>
                            <option value="xendit">Xendit</option>
                            <option value="duitku">Duitku</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-400">Merchant Code / ID</label>
                        <input 
                            type="text"
                            value={paymentConfig.merchantCode || ''}
                            onChange={(e) => setPaymentConfig({...paymentConfig, merchantCode: e.target.value})}
                            placeholder="e.g. M12345"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 flex justify-between">
                                <span>Client Key</span>
                                <button onClick={() => toggleSecret('clientKey')} className="text-emerald-500 text-[10px] hover:underline">
                                    {showSecrets['clientKey'] ? 'Hide' : 'Show'}
                                </button>
                            </label>
                            <div className="relative">
                                <input 
                                    type={showSecrets['clientKey'] ? "text" : "password"}
                                    value={paymentConfig.clientKey || ''}
                                    onChange={(e) => setPaymentConfig({...paymentConfig, clientKey: e.target.value})}
                                    placeholder="Client Key (Public)"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                                />
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                            </div>
                        </div>

                         <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400 flex justify-between">
                                <span>Server Key</span>
                                <button onClick={() => toggleSecret('serverKey')} className="text-emerald-500 text-[10px] hover:underline">
                                    {showSecrets['serverKey'] ? 'Hide' : 'Show'}
                                </button>
                            </label>
                            <div className="relative">
                                <input 
                                    type={showSecrets['serverKey'] ? "text" : "password"}
                                    value={paymentConfig.serverKey || ''}
                                    onChange={(e) => setPaymentConfig({...paymentConfig, serverKey: e.target.value})}
                                    placeholder="Server Key (Secret)"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                                />
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-zinc-950/50 rounded-lg border border-dashed border-zinc-800">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <Terminal size={14} />
                            <span className="text-xs font-mono">Notification URL</span>
                        </div>
                        <code className="text-xs text-zinc-500 block break-all">
                            https://tkztavbgtqfusfghoxay.supabase.co/functions/v1/payment-notification
                        </code>
                    </div>
                </div>
             </div>

             <div className="flex justify-end">
                <button 
                    onClick={handleSavePayment}
                    disabled={loading}
                    className="bg-emerald-550 hover:bg-emerald-600 active:scale-95 transition-all text-zinc-950 font-bold py-3 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Payment Settings
                </button>
             </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;