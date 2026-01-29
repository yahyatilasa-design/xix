import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { supabase } from '../services/supabaseClient';
import { uploadProduct } from '../services/productService';
import { generateSlug } from '../utils/slugHelper';
import { Loader2, Upload, Save, X, Image as ImageIcon, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddProductFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onCancel, onSuccess }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  
  // Form State
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [sellerUsername, setSellerUsername] = useState<string | null>(null);
  
  // Helper state to stop auto-generation if user manually edits slug
  const [isManualSlug, setIsManualSlug] = useState<boolean>(false);
  
  // File State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  // 1. Initial Auth & Profile Check
  useEffect(() => {
    const initForm = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
           setMessage({ type: 'error', text: 'Sesi habis. Silakan login kembali.' });
           setCheckingAuth(false);
           return;
        }

        // Fetch Profile untuk dapat Username & Role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username, role')
          .eq('id', user.id)
          .single();

        if (error || !profile) {
           setMessage({ type: 'error', text: 'Gagal memuat profil penjual.' });
        } else {
           setSellerUsername(profile.username);
           if (!['admin', 'seller'].includes(profile.role)) {
              setMessage({ type: 'error', text: 'Akun Anda tidak memiliki izin untuk menjual produk.' });
           }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingAuth(false);
      }
    };

    initForm();
  }, []);

  // 2. Auto-generate slug when name changes (unless manually edited)
  useEffect(() => {
    if (!isManualSlug) {
      const newSlug = generateSlug(name);
      setSlug(newSlug);
    }
  }, [name, isManualSlug]);

  // Handle Slug Manual Edit
  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSlug(generateSlug(e.target.value)); // Keep sanitizing input for valid URL chars
    setIsManualSlug(true); // Stop auto-generation
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { 
        setMessage({ type: 'error', text: 'Ukuran gambar maksimal 2MB' });
        return;
      }
      setImageFile(file);
      setMessage(null);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProductFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Anda harus login terlebih dahulu.");

      if (!slug || slug.length < 3) {
        throw new Error("Slug URL terlalu pendek.");
      }

      // Call Service Function
      await uploadProduct({
        seller_id: user.id, // UID yang benar
        name,
        slug, // Slug hasil input/auto-gen
        description,
        price: parseFloat(price) || 0,
        imageFile,
        productFile
      });

      setMessage({ type: 'success', text: 'Produk berhasil ditambahkan!' });
      
      // Reset Form
      setName('');
      setPrice('');
      setDescription('');
      setSlug('');
      setIsManualSlug(false);
      setImageFile(null);
      setProductFile(null);

      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error: unknown) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak terduga.";
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex justify-center items-center w-full max-w-2xl mx-auto">
            <Loader2 className="animate-spin text-emerald-500" />
        </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl mx-auto shadow-2xl">
      <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Add Digital Product</h2>
          <p className="text-xs text-zinc-500 mt-1">List your item for sale on the marketplace.</p>
        </div>
        <button onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Product Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Premium UI Kit"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Price (IDR)</label>
            <input 
              type="number" 
              required
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="50000"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Slug (Dynamic User Route) */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400">Product URL</label>
          <div className="flex items-center">
             {/* Menampilkan Username dari Profile */}
             <span className="bg-zinc-800 text-zinc-500 text-xs px-3 py-3.5 rounded-l-xl border-y border-l border-zinc-700 font-mono truncate max-w-[150px]">
                /{sellerUsername || 'username'}/
             </span>
             <input 
              type="text" 
              required
              value={slug}
              onChange={handleSlugChange}
              placeholder="product-slug"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-r-xl px-4 py-3 text-sm text-emerald-500 font-mono focus:border-emerald-500/50 focus:outline-none transition-all"
            />
          </div>
          <p className="text-[10px] text-zinc-600">URL will be: domain.com/{sellerUsername || 'username'}/{slug || 'product-slug'}</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400">Description</label>
          <textarea 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Image Upload */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                    <ImageIcon size={14} /> Product Image (Public)
                </label>
                <div className="relative border-dashed border-2 border-zinc-800 rounded-xl p-4 hover:bg-zinc-900/50 transition-colors text-center cursor-pointer group">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center">
                        <Upload size={20} className="text-zinc-500 mb-2 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-xs text-zinc-400 truncate w-full px-2">{imageFile ? imageFile.name : 'Click to upload image'}</span>
                    </div>
                </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                    <FileText size={14} /> Digital Asset (Private)
                </label>
                <div className="relative border-dashed border-2 border-zinc-800 rounded-xl p-4 hover:bg-zinc-900/50 transition-colors text-center cursor-pointer group">
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                     <div className="flex flex-col items-center">
                        <Upload size={20} className="text-zinc-500 mb-2 group-hover:text-emerald-500 transition-colors" />
                        <span className="text-xs text-zinc-400 truncate w-full px-2">{productFile ? productFile.name : 'Click to upload file'}</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800 mt-2">
             <button 
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit"
                disabled={loading}
                className="bg-emerald-550 hover:bg-emerald-600 active:scale-95 transition-all text-zinc-950 font-bold py-3 px-8 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Create Product
            </button>
        </div>

      </form>
    </div>
  );
};

export default AddProductForm;