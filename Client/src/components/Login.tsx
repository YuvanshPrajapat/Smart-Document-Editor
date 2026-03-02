import React, { useState } from 'react';
import { LogIn, User, Lock, ShieldCheck, Sparkles, ArrowRight, BookOpen, Building2 } from 'lucide-react';

type UserRole = 'End User' | 'Alpha Manager' | 'Administrative User';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'End User' as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Sequence: System sends credentials to Auth Service [cite: 207, 273]
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-4 font-sans">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500">
        <div className="p-10 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 text-white shadow-lg">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-slate-500 mt-2 font-semibold italic text-sm">Smart Document Editor v2.0</p>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" 
                placeholder="Enter username"
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
              {isLogin && <button type="button" className="text-xs font-bold text-blue-600">Forgot?</button>}
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="password" required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" 
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Department</label>
                <div className="relative group">
                  <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500" placeholder="e.g. Science" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Area of Focus</label>
                <div className="relative group">
                  <BookOpen className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <select className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none">
                    <option>OCR Digitization</option>
                    <option>LaTeX Research</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">System Role</label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <select 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer font-bold text-slate-700"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
              >
                <option value="End User">End User (Student/Researcher)</option>
                <option value="Alpha Manager">Alpha Manager (Project Lead)</option>
                <option value="Administrative User">Administrative User (IT Admin)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 active:scale-95 transition-all mt-4"
          >
            {loading ? "Processing..." : <><span className="tracking-widest uppercase">{isLogin ? 'Sign In' : 'Join'}</span><ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-sm font-bold text-slate-500">
            {isLogin ? "New here?" : "Already have an account?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:text-indigo-700 underline underline-offset-4">
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}