import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Mail, User as UserIcon, Sparkles, ArrowRight, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      if (tab === 'login') {
        const result = authService.login(email, password);
        setLoading(false);
        if (result.success && result.user) {
          onSuccess(result.user);
          onClose();
        } else {
          setError(result.error || 'Login failed.');
        }
      } else {
        const result = authService.register(name, email, password);
        setLoading(false);
        if (result.success && result.user) {
          onSuccess(result.user);
          onClose();
        } else {
          setError(result.error || 'Registration failed.');
        }
      }
    }, 400);
  };

  const handleGuestLogin = () => {
    const guest = authService.loginAsGuest();
    onSuccess(guest);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md overflow-hidden bg-white border border-[#E2E8F0] rounded-3xl shadow-2xl text-[#1A1F2B]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#64748B] hover:text-[#1A1F2B] hover:bg-[#F1F5F9] rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 pb-2 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-[#EBF8FF] border border-[#BEE3F8] rounded-2xl text-[#4A90E2] shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl tracking-tight font-semibold text-[#1A1F2B]">
              {tab === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {tab === 'login'
                ? 'Access your private collage, saved articles & images'
                : 'Start curating your personal editorial space'}
            </p>

            {/* Tab switch */}
            <div className="flex p-1 mt-6 bg-[#F1F5F9] rounded-2xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
                  tab === 'login'
                    ? 'bg-white text-[#1A1F2B] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1A1F2B]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
                  tab === 'register'
                    ? 'bg-white text-[#1A1F2B] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1A1F2B]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Register
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
            {error && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                {error}
              </div>
            )}

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4A90E2]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="curator@collage.io"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4A90E2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-[#1A1F2B] placeholder-[#94A3B8] focus:outline-none focus:border-[#4A90E2]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#1A1F2B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-[#4A90E2] to-[#7B61FF] hover:opacity-95 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In to Workspace' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest Session Option */}
          <div className="p-6 pt-0 border-t border-[#E2E8F0] bg-[#F8FAFC] text-center space-y-2">
            <p className="text-xs text-[#64748B] pt-3 font-medium">¿Prefieres explorar primero?</p>
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2 px-4 text-xs bg-white hover:bg-[#F1F5F9] text-[#1A1F2B] border border-[#CBD5E1] rounded-xl transition-colors font-semibold shadow-2xs flex items-center justify-center gap-2"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#4A90E2]" />
              <span>Entrar como Invitado</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
