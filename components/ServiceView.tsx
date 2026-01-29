import React, { useState } from 'react';
import { ArrowLeft, Search, Check, Smartphone, Zap, Gamepad2, Wallet, ShieldCheck, Wifi, Receipt, Grid } from 'lucide-react';
import { ServiceItem, Product, CurrencyCode } from '../types';
import { formatCurrency } from '../services/currencyService';
import { checkPrice, createTransaction } from '../services/ppobService';

interface ServiceViewProps {
  service: ServiceItem;
  onBack: () => void;
  currency: CurrencyCode;
  rates: Partial<Record<CurrencyCode, number>>;
}

const ServiceView: React.FC<ServiceViewProps> = ({ service, onBack, currency, rates }) => {
  const [customerNo, setCustomerNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [txStatus, setTxStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  // Map icon string to component for display
  const IconMap: any = {
    Signal: Smartphone,
    Zap: Zap,
    Gamepad2: Gamepad2,
    Wallet: Wallet,
    ShieldCheck: ShieldCheck,
    Wifi: Wifi,
    Receipt: Receipt,
    Grid: Grid
  };
  const Icon = IconMap[service.icon] || Grid;

  const handleCheck = async () => {
    if (!customerNo) return;
    setLoading(true);
    try {
        // Simulate fetching products based on the service type
        // In a real app, you'd fetch specific SKUs. Here we mock it or call the checkPrice if SKU is known.
        // For demo purposes, we generate a list based on the service.
        await new Promise(r => setTimeout(r, 800)); // Fake network lag
        
        let mockProducts = [];
        if (service.nameKey === 'data' || service.nameKey === 'internet') {
            mockProducts = [
                { sku: 'DATA1GB', name: 'Internet 1GB', price: 15000 },
                { sku: 'DATA5GB', name: 'Internet 5GB', price: 45000 },
                { sku: 'DATA10GB', name: 'Internet 10GB', price: 80000 },
            ];
        } else if (service.nameKey === 'pln') {
            mockProducts = [
                { sku: 'PLN20', name: 'Token PLN 20k', price: 20500 },
                { sku: 'PLN50', name: 'Token PLN 50k', price: 50500 },
                { sku: 'PLN100', name: 'Token PLN 100k', price: 100500 },
            ];
        } else {
             mockProducts = [
                { sku: 'VOUCHER10', name: `${service.nameKey} 10k`, price: 11000 },
                { sku: 'VOUCHER50', name: `${service.nameKey} 50k`, price: 52000 },
            ];
        }
        setProducts(mockProducts);
        setSelectedProduct(null);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct || !customerNo) return;
    setTxStatus('processing');
    try {
        await createTransaction({
            sku: selectedProduct.sku,
            customerNo: customerNo,
            refId: `TRX-${Date.now()}`
        });
        setTxStatus('success');
    } catch (e) {
        console.error(e);
        setTxStatus('failed');
    }
  };

  if (txStatus === 'success') {
      return (
          <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <Check size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Transaction Successful!</h2>
              <p className="text-zinc-400 mb-8">Your {selectedProduct?.name} has been processed for {customerNo}.</p>
              <button onClick={onBack} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-xl transition-all">
                  Back to Home
              </button>
          </div>
      );
  }

  return (
    <div className="px-4 pt-24 pb-24 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-white">
            <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500">
                <Icon size={20} />
            </div>
            <h1 className="text-xl font-bold text-white capitalize">{service.nameKey}</h1>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6 relative z-10">
          <label className="text-xs font-medium text-zinc-400 mb-2 block">
              {service.nameKey === 'pln' ? 'Meter / ID Pelanggan' : 'Phone Number / ID'}
          </label>
          <div className="flex gap-2">
              <input 
                type="text" 
                value={customerNo}
                onChange={(e) => setCustomerNo(e.target.value)}
                placeholder={service.nameKey === 'pln' ? 'Enter Meter ID' : '0812...'}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
              />
              <button 
                onClick={handleCheck}
                disabled={loading || !customerNo}
                className="bg-emerald-550 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all text-zinc-950 rounded-xl px-4 flex items-center justify-center"
              >
                  <Search size={20} />
              </button>
          </div>
      </div>

      {/* Product List */}
      <div className="space-y-3">
          {products.map((p) => (
              <div 
                key={p.sku}
                onClick={() => setSelectedProduct(p)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${selectedProduct?.sku === p.sku ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900'}`}
              >
                  <div>
                      <h3 className="text-sm font-bold text-white">{p.name}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{p.sku}</p>
                  </div>
                  <div className="text-right">
                      <p className={`text-sm font-mono font-bold ${selectedProduct?.sku === p.sku ? 'text-emerald-400' : 'text-zinc-300'}`}>
                          {formatCurrency(p.price, currency, rates)}
                      </p>
                  </div>
              </div>
          ))}
          
          {products.length === 0 && !loading && customerNo && (
              <div className="text-center py-8 text-zinc-500 text-sm">
                  Click search to see available packages.
              </div>
          )}
      </div>

      {/* Bottom Action */}
      {selectedProduct && (
          <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-20">
              <button 
                onClick={handlePurchase}
                disabled={txStatus === 'processing'}
                className="w-full bg-emerald-550 hover:bg-emerald-600 active:scale-95 transition-all text-zinc-950 font-bold py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                  {txStatus === 'processing' ? 'Processing...' : `Pay ${formatCurrency(selectedProduct.price, currency, rates)}`}
              </button>
          </div>
      )}
    </div>
  );
};

export default ServiceView;