import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mail, Phone, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2, User, Calendar, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email'); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const formatPhone = (p: string) => {
    return p.startsWith('0') ? `+62${p.slice(1)}` : p.startsWith('62') ? `+${p}` : p;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (authView === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: fullName,
              phone_number: formatPhone(phone),
              date_of_birth: dob,
              role: 'user' 
            },
          },
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Registration successful! Please check your email to confirm.' });
        setLoading(false); 
      } 
      else if (authView === 'login') {
        if (authMethod === 'email') {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          // Success! We do NOT set loading to false here, to prevent the form from reappearing.
          // App.tsx will detect the session change and unmount this component.
        } else {
          const formattedPhone = formatPhone(phone);
          if (!showOtpInput) {
            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            });
            if (error) throw error;
            setShowOtpInput(true);
            setMessage({ type: 'success', text: 'OTP sent! Please check your message.' });
            setLoading(false);
          } else {
             const { error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'sms',
            });
            if (error) throw error;
            // Success! Keep loading true until unmount.
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      setMessage({ type: 'error', text: error.message || 'Authentication failed' });
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
    } catch (error: any) {
        setMessage({ type: 'error', text: error.message });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-800/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center transform rotate-3 mx-auto mb-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
             <span className="font-mono font-bold text-zinc-950 text-xl tracking-tighter">XIX</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
            {authView === 'login' ? 'Welcome Back' : authView === 'register' ? 'Join XIX' : 'Reset Password'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {authView === 'login' ? 'Enter your credentials to access your wallet.' : 
             authView === 'register' ? 'Create your secure digital profile.' :
             'Enter your email to receive a reset link.'}
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          
          {authView !== 'forgot_password' && (
            <div className="flex p-1 bg-zinc-950 rounded-lg mb-6 border border-zinc-800/50">
              <button 
                onClick={() => { setAuthView('login'); setMessage(null); setShowOtpInput(false); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${authView === 'login' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthView('register'); setMessage(null); setShowOtpInput(false); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${authView === 'register' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Register
              </button>
            </div>
          )}

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              {message.text}
            </div>
          )}

          {authView === 'forgot_password' && (
             <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium ml-1">Email Address</label>
                    <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        required
                    />
                    </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-emerald-550 hover:bg-emerald-600 active:scale-95 transition-all text-zinc-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Reset Link'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setAuthView('login'); setMessage(null); }}
                  className="w-full text-zinc-500 text-xs hover:text-white transition-colors py-2 flex items-center justify-center gap-2"
                >
                   <ArrowLeft size={14} /> Back to Sign In
                </button>
             </form>
          )}

          {authView === 'register' && (
             <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input 
                            type="text" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium ml-1">Date of Birth</label>
                    <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input 
                            type="date" 
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium ml-1">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08123456789"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-emerald-550 hover:bg-emerald-600 active:scale-95 transition-all text-zinc-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : (
                      <>
                        Create Account <ArrowRight size={18} strokeWidth={2.5} />
                      </>
                  )}
                </button>
             </form>
          )}

          {authView === 'login' && (
             <form onSubmit={handleAuth} className="space-y-4">
                 <div className="flex gap-4 mb-4 justify-center">
                    <button 
                       type="button"
                       onClick={() => setAuthMethod('email')}
                       className={`text-xs flex items-center gap-1 ${authMethod === 'email' ? 'text-emerald-500 font-bold' : 'text-zinc-500'}`}
                    >
                        <Mail size={14} /> Email
                    </button>
                    <div className="w-px h-4 bg-zinc-800"></div>
                    <button 
                       type="button"
                       onClick={() => setAuthMethod('phone')}
                       className={`text-xs flex items-center gap-1 ${authMethod === 'phone' ? 'text-emerald-500 font-bold' : 'text-zinc-500'}`}
                    >
                        <Phone size={14} /> Phone
                    </button>
                 </div>

                 {authMethod === 'email' && (
                     <>
                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-medium ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-medium ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={() => { setAuthView('forgot_password'); setMessage(null); }}
                                    className="text-[11px] text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                     </>
                 )}

                 {authMethod === 'phone' && (
                     <>
                       {!showOtpInput ? (
                          <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-medium ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="08123456789"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    required
                                />
                            </div>
                          </div>
                       ) : (
                          <div className="space-y-1.5">
                            <label className="text-xs text-zinc-400 font-medium ml-1">Enter OTP</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-xs">OTP</div>
                                <input 
                                    type="text" 
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono tracking-widest"
                                    required
                                    maxLength={6}
                                />
                            </div>
                        </div>
                       )}
                     </>
                 )}

                 <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-emerald-550 hover:bg-emerald-600 active:scale-95 transition-all text-zinc-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : (
                      <>
                        {authMethod === 'phone' && !showOtpInput ? 'Send Code' : 'Sign In'}
                        <ArrowRight size={18} strokeWidth={2.5} />
                      </>
                  )}
                </button>
             </form>
          )}

        </div>
        
        <p className="text-center text-[10px] text-zinc-600 mt-6">
          By continuing, you agree to XIX's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};