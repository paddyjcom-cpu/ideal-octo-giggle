import React, { useState } from 'react';
import { supabase } from "../services/supabase";
import { TrendingUp, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const AuthView: React.FC<{onLogin:(e:string)=>void}> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message); setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message); else alert("Check email for link!"); setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-md space-y-8">
        <div className="text-center"><div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black">RF</div>
        <h2 className="text-3xl font-black">Welcome Back</h2></div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={email} onChange={e=>setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black">{loading ? '...' : 'Login'}</button>
          <button type="button" onClick={handleSignup} className="w-full text-slate-400 font-bold text-sm">Create Beta Account</button>
        </form>
      </div>
    </div>
  );
};
export default AuthView;
