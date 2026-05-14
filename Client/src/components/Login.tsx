import React, { useState } from 'react';
import { User, Lock, Sparkles, ArrowRight, Mail } from 'lucide-react';
import { authService } from '../services/auth';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDark, setIsDark] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        await authService.login(formData.username, formData.password);
        setLoading(false);
        onLoginSuccess();
      } else {
        await authService.register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        setLoading(false);
        setIsLogin(true);
        setErrorMsg('Registration successful! Please log in.');
      }
    } catch (err: any) {
      setLoading(false);
      console.error(err);
      setErrorMsg(isLogin ? "Invalid credentials." : "User might already exist.");
    }
  };

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? 'bg-[#0f1117]' : 'bg-[#f0f2f5]'}`}
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {/* Left Panel */}
      <div
        className={`hidden lg:flex flex-col justify-between w-[480px] p-12 border-r ${
          isDark
            ? 'bg-[#13151c] border-[#1e2130]'
            : 'bg-white border-[#e0e3e8]'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* <div className="w-8 h-8 bg-blue-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div> */}
          <span className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            SMART DOCUMENT EDITOR
          </span>
        </div>

        <div>
          {/* <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Smart Document Editor
          </p> */}
          <h2 className={`text-4xl font-black leading-tight mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Write faster.<br />
            Think clearer.<br />
            <span className="text-blue-600">Collaborate live.</span>
          </h2>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            A professional editor with AI-powered OCR, real-time collaboration, LaTeX math, and one-click export — built for serious writers.
          </p>
        </div>

        <div className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          © 2026 Smart Document Editor. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative">

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 text-xs font-bold border transition-colors ${
            isDark
              ? 'border-[#2a2d3a] text-slate-400 hover:text-white bg-[#1a1d26]'
              : 'border-[#dde0e6] text-slate-500 hover:text-slate-800 bg-white'
          }`}
        >
          {isDark ? '☀ Light' : '☾ Dark'}
        </button>

        <div className="w-full max-w-[420px]">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              {/* <div className="w-7 h-7 bg-blue-600 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div> */}
              <span className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>SDE</span>
            </div>
            <h1 className={`text-2xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isLogin ? 'Sign in to your account' : 'Create an account'}
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isLogin ? 'Enter your credentials to continue.' : 'Fill in the details to get started.'}
            </p>
          </div>

          {/* Error / Success */}
          {errorMsg && (
            <div className={`mb-5 px-4 py-3 text-sm font-semibold border-l-4 ${
              errorMsg.includes('successful')
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Username
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text" required
                  className={`w-full pl-10 pr-4 py-3 text-sm border outline-none transition-all ${
                    isDark
                      ? 'bg-[#1a1d26] border-[#2a2d3a] text-white placeholder-slate-600 focus:border-blue-500 focus:bg-[#1e2130]'
                      : 'bg-white border-[#dde0e6] text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                  }`}
                  placeholder="your_username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className={`block text-xs font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="email" required={!isLogin}
                    className={`w-full pl-10 pr-4 py-3 text-sm border outline-none transition-all ${
                      isDark
                        ? 'bg-[#1a1d26] border-[#2a2d3a] text-white placeholder-slate-600 focus:border-blue-500 focus:bg-[#1e2130]'
                        : 'bg-white border-[#dde0e6] text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                    }`}
                    placeholder="hello@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Password
                </label>
                {isLogin && (
                  <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="password" required
                  className={`w-full pl-10 pr-4 py-3 text-sm border outline-none transition-all ${
                    isDark
                      ? 'bg-[#1a1d26] border-[#2a2d3a] text-white placeholder-slate-600 focus:border-blue-500 focus:bg-[#1e2130]'
                      : 'bg-white border-[#dde0e6] text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]'
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold tracking-wide transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <span className="uppercase tracking-widest">{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className={`mt-6 pt-5 border-t text-center text-sm ${isDark ? 'border-[#1e2130] text-slate-500' : 'border-[#e8eaed] text-slate-500'}`}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              {isLogin ? 'Register' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
