import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { TrendingUp, Mail, Lock, ArrowRight, Loader2, User, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props {
  onLogin: (email: string) => void;
}

const AuthView: React.FC<Props> = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setShowResend(false);

    try {
      if (isSignup) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (signUpError) throw signUpError;
        setSuccess('Success! Check your email inbox (and spam folder) for the verification link.');
        setIsSignup(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          if (signInError.message.toLowerCase().includes('email not confirmed')) {
            setShowResend(true);
          }
          if (signInError.message.toLowerCase().includes('invalid login credentials')) {
             throw new Error('Invalid credentials. Try again or sign up for a new account if you haven\'t yet.');
          }
          throw signInError;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setIsResending(true);
    setError(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (resendError) throw resendError;
      setSuccess('A new confirmation link has been sent to your email!');
      setShowResend(false);
    } catch (err: any) {
      setError('Failed to resend confirmation: ' + err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-200 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 opacity-50"></div>

      <div className="w-full max-w-md relative">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 p-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200 mx-auto mb-6 transform -rotate-6">
              <TrendingUp className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {isSignup ? 'Join ResellFlow' : 'ResellFlow AI'}
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              {isSignup ? 'Start your cloud-synced reselling journey.' : 'The OS for modern resellers.'}
            </p>
          </div>

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-emerald-700 leading-relaxed">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-600 leading-relaxed">{error}</p>
              </div>
              {showResend && (
                <button 
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all disabled:opacity-50 shadow-sm"
                >
                  {isResending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Resend Verification Email
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required={isSignup}
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-700"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all group disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (
                <>
                  {isSignup ? 'Create Account' : 'Secure Login'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 flex items-center gap-4">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Supabase Cloud</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          <p className="text-center text-xs font-bold text-slate-400">
            {isSignup ? 'Already have an account?' : 'New to ResellFlow?'} {' '}
            <button 
              type="button"
              onClick={() => { setIsSignup(!isSignup); setError(null); setSuccess(null); setShowResend(false); }} 
              className="text-indigo-600 font-black hover:text-indigo-700 transition-colors"
            >
              {isSignup ? 'Login instead' : 'Create a Beta account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
